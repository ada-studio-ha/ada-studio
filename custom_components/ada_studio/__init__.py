from __future__ import annotations

import base64
from collections import OrderedDict
import filecmp
import hashlib
import io
import json
import logging
import os
import re
import secrets
import shutil
import tempfile
import threading
import time
import unicodedata

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import Unauthorized
from homeassistant.helpers.typing import ConfigType
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

DOMAIN = "ada_studio"
STATIC_URL = "/ada_studio_static"
MODULE_VERSION = "1.0.0-beta.1"

DEFAULT_FOLDER = "www/ada_studio"
DEFAULT_TITLE = "Ada Studio"
DEFAULT_ICON = "mdi:vector-square-edit"
ALLOWED_EXT = {".svg", ".css", ".yaml", ".json"}
SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")
PROJ_NAME = re.compile(r"^[a-z0-9_-]{1,40}$")
PROJECT_FILE = "progetto.json"
PREVIEW_FILE = "anteprima.jpg"
MAX_PREVIEW = 512 * 1024
EMPTY_PROJECT = '{"format": 2}'
IMG_DIR = "immagini"
OLD_IMG_DIRS = ("sfondo", "stati")
PROJ_IMG_DIRS = (IMG_DIR,) + OLD_IMG_DIRS
SUBDIRS = (IMG_DIR, "stili")
MAX_BYTES = 8 * 1024 * 1024

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
MAX_IMG = 40 * 1024 * 1024
MAX_LIST = 2000
THUMB_BOX = (224, 168)
THUMB_BATCH = 24
THUMB_CACHE = 600
UPLOAD_CHUNK = 1024 * 1024
UPLOAD_MAX_ACTIVE = 4
UPLOAD_IDLE = 30 * 60

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


def _digest(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha1(handle.read(), usedforsecurity=False).hexdigest()[:8]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    here = os.path.dirname(__file__)
    module_file = os.path.join(here, "ada-studio.js")
    if not os.path.isfile(module_file):
        _LOGGER.error(
            "ada-studio.js missing in %s: copy all the files into the same folder",
            here,
        )
        return False

    try:
        from homeassistant.components.http import StaticPathConfig

        digest = await hass.async_add_executor_job(_digest, module_file)
        await hass.http.async_register_static_paths(
            [StaticPathConfig(f"{STATIC_URL}/ada-studio.js", module_file, True)]
        )
    except Exception:
        _LOGGER.exception("Static file registration failed")
        return False

    hass.data[DOMAIN] = {
        "target": None,
        "digest": digest,
        "thumbs": _ThumbCache(THUMB_CACHE),
        "uploads": _Uploads(),
    }
    hass.http.register_view(AdaStudioSaveView(hass))
    for command in (
        ws_save,
        ws_projects,
        ws_preview,
        ws_project_open,
        ws_project_new,
        ws_project_delete,
        ws_files,
        ws_thumbs,
        ws_file_copy,
        ws_yaml,
        ws_upload_begin,
        ws_upload_chunk,
        ws_upload_finish,
        ws_upload_cancel,
    ):
        websocket_api.async_register_command(hass, command)
    return True


def bad_folder(folder: str) -> bool:
    parts = folder.replace("\\", "/").split("/")
    return folder.startswith(("/", "\\")) or ":" in folder or ".." in parts


def _options(entry: ConfigEntry) -> tuple[str, str, str]:
    opts = entry.options
    folder = (opts.get("folder") or "").strip().rstrip("/\\")
    if not folder or bad_folder(folder):
        folder = DEFAULT_FOLDER
    title = (opts.get("sidebar_title") or "").strip() or DEFAULT_TITLE
    icon = (opts.get("sidebar_icon") or "").strip() or DEFAULT_ICON
    return folder, title, icon


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    data = hass.data.get(DOMAIN)
    if not data:
        return False
    folder, title, icon = _options(entry)

    target = hass.config.path(folder)
    try:
        await hass.async_add_executor_job(lambda: os.makedirs(target, exist_ok=True))
    except OSError:
        _LOGGER.exception("Cannot create folder %s", target)
        return False

    module_url = f"{STATIC_URL}/ada-studio.js?v={MODULE_VERSION}-{data['digest']}"
    try:
        from homeassistant.components.panel_custom import async_register_panel

        await async_register_panel(
            hass,
            frontend_url_path=DOMAIN,
            webcomponent_name="ada-studio",
            module_url=module_url,
            sidebar_title=title,
            sidebar_icon=icon,
            require_admin=True,
            config={"folder": folder, "version": MODULE_VERSION},
        )
    except Exception:
        _LOGGER.warning(
            "panel_custom not usable, registering the panel directly",
            exc_info=True,
        )
        try:
            from homeassistant.components import frontend

            frontend.async_register_built_in_panel(
                hass,
                component_name="custom",
                sidebar_title=title,
                sidebar_icon=icon,
                frontend_url_path=DOMAIN,
                require_admin=True,
                config={
                    "folder": folder,
                    "version": MODULE_VERSION,
                    "_panel_custom": {
                        "name": "ada-studio",
                        "embed_iframe": False,
                        "trust_external": False,
                        "module_url": module_url,
                    },
                },
            )
        except Exception:
            _LOGGER.exception("Panel registration failed")
            return False

    data["target"] = target
    entry.async_on_unload(entry.add_update_listener(_options_changed))
    _LOGGER.warning(
        "Ada Studio started: panel /%s, module %s, writing to %s",
        DOMAIN,
        module_url,
        target,
    )
    return True


async def _options_changed(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    from homeassistant.components import frontend

    frontend.async_remove_panel(hass, DOMAIN)
    data = hass.data.get(DOMAIN)
    if data:
        data["target"] = None
    return True


class ProjectConflict(Exception):

    def __init__(self, current: int) -> None:
        super().__init__(str(current))
        self.current = current


def _project_dir(target, project):
    if not project:
        return target
    if not PROJ_NAME.match(project):
        raise ValueError(f"Project name not allowed: {project}")
    base = os.path.realpath(target)
    path = os.path.join(target, project)
    if os.path.commonpath([os.path.realpath(path), base]) != base:
        raise ValueError(f"Path not allowed: {project}")
    return path


def _summary(path):
    info = {"ver": 0, "format": 0, "need": 0, "objects": 0, "bg": "", "w": 0, "h": 0}
    try:
        with open(os.path.join(path, PROJECT_FILE), encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        return info, None
    if not isinstance(data, dict):
        return info, None
    fmt = data.get("format")
    info["format"] = fmt if isinstance(fmt, int) and not isinstance(fmt, bool) else 1
    need = data.get("need")
    info["need"] = need if isinstance(need, int) and not isinstance(need, bool) and need > 0 else 0
    items = data.get("objects" if info["format"] >= 2 else "shapes")
    info["ver"] = int(data.get("ver") or 0)
    info["objects"] = len(items) if isinstance(items, list) else 0
    bg = data.get("bgPath") or ""
    if not bg and isinstance(data.get("bgs"), list):
        bg = next((b.get("p") for b in data["bgs"] if isinstance(b, dict) and b.get("p")), "")
    info["bg"] = str(bg or "")
    info["w"] = int(data.get("w") or 0)
    info["h"] = int(data.get("h") or 0)
    return info, data


def _list_projects(target):
    out = []
    try:
        names = sorted(os.listdir(target))
    except OSError:
        return out
    for name in names:
        path = os.path.join(target, name)
        if not os.path.isdir(path) or not PROJ_NAME.match(name):
            continue
        info, _ = _summary(path)
        info["name"] = name
        try:
            info["at"] = os.path.getmtime(os.path.join(path, PROJECT_FILE))
        except OSError:
            info["at"] = 0
        try:
            info["pv"] = int(os.path.getmtime(os.path.join(path, PREVIEW_FILE)))
        except OSError:
            info["pv"] = 0
        out.append(info)
    return out


def _read_project(target, project):
    path = os.path.join(_project_dir(target, project), PROJECT_FILE)
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def _new_project(target, project, source, content):
    path = _project_dir(target, project)
    if os.path.exists(path):
        raise FileExistsError(project)
    src = _project_dir(target, source) if source else None
    if src and not os.path.isdir(src):
        raise FileNotFoundError(source)
    base = os.path.realpath(src) if src else None
    if src and not _inside(base, os.path.join(src, PROJECT_FILE)):
        raise ValueError(f"Path not allowed: {source}")
    os.makedirs(path)
    for sub in SUBDIRS:
        os.makedirs(os.path.join(path, sub), exist_ok=True)
    if src:
        shutil.copyfile(
            os.path.join(src, PROJECT_FILE), os.path.join(path, PROJECT_FILE)
        )
        styles = os.path.join(src, "stili")
        if os.path.isdir(styles) and _inside(base, styles):
            for name in os.listdir(styles):
                one = os.path.join(styles, name)
                if os.path.isfile(one) and SAFE_NAME.match(name) and _inside(base, one):
                    shutil.copyfile(one, os.path.join(path, "stili", name))
    else:
        with open(os.path.join(path, PROJECT_FILE), "w", encoding="utf-8") as handle:
            handle.write(content or EMPTY_PROJECT)
    return project


def _delete_project(target, project):
    path = _project_dir(target, project)
    if not project or not os.path.isdir(path):
        raise FileNotFoundError(project)
    shutil.rmtree(path)
    return project


def _write_preview(target, project, data):
    folder = _project_dir(target, project)
    if not os.path.isfile(os.path.join(folder, PROJECT_FILE)):
        raise FileNotFoundError(project)
    _atomic_write(os.path.join(folder, PREVIEW_FILE), data)
    return PREVIEW_FILE


def _new_tmp(path):
    folder, name = os.path.split(path)
    fd, tmp = tempfile.mkstemp(prefix=f".{name}.", suffix=".tmp", dir=folder)
    os.fchmod(fd, 0o644)
    return fd, tmp


def _atomic_write(path, data):
    fd, tmp = _new_tmp(path)
    try:
        if isinstance(data, bytes):
            with os.fdopen(fd, "wb") as handle:
                handle.write(data)
        else:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(data)
        os.replace(tmp, path)
    except BaseException:
        _tmp_drop(tmp)
        raise


def _validate(files):
    if not isinstance(files, list) or not files:
        return None, "No files to write"
    plan = []
    for item in files:
        if not isinstance(item, dict):
            return None, "Invalid entry"
        name = str(item.get("name", ""))
        content = item.get("content")
        if not SAFE_NAME.match(name) or ".." in name:
            return None, f"File name not allowed: {name}"
        if os.path.splitext(name)[1].lower() not in ALLOWED_EXT:
            return None, f"Extension not allowed: {name}"
        if not isinstance(content, str):
            return None, f"Invalid content: {name}"
        if len(content.encode("utf-8")) > MAX_BYTES:
            return None, f"File too large: {name}"
        plan.append((name, content))
    return plan, None


def _write_files(target, plan, project=None, prev=None):
    folder = _project_dir(target, project)
    if project and not os.path.isdir(folder):
        raise FileNotFoundError(project)
    if project and prev is not None:
        info, data = _summary(folder)
        if data is not None and info["ver"] != prev:
            raise ProjectConflict(info["ver"])
    base = os.path.realpath(folder)
    written = []
    for name, content in plan:
        path = os.path.join(folder, name)
        if os.path.commonpath([os.path.realpath(path), base]) != base:
            raise ValueError(name)
        _atomic_write(path, content)
        written.append(name)
    return written


def _target(hass: HomeAssistant):
    return (hass.data.get(DOMAIN) or {}).get("target")




class NameTaken(Exception):

    def __init__(self, free: str, taken: str) -> None:
        super().__init__(free)
        self.free = free
        self.taken = taken


def _media_roots(hass: HomeAssistant) -> dict[str, str]:
    dirs = getattr(hass.config, "media_dirs", None) or {}
    return {f"media:{key}": str(path) for key, path in dirs.items()}


def _inside(base: str, path: str) -> bool:
    return os.path.commonpath([os.path.realpath(path), base]) == base


def _proj_img_dirs(target, project):
    if not project:
        raise ValueError("No project open")
    pdir = os.path.realpath(_project_dir(target, project))
    out = []
    for sub in PROJ_IMG_DIRS:
        path = os.path.join(pdir, sub)
        if os.path.isdir(path) and _inside(pdir, path):
            out.append((sub, os.path.realpath(path)))
    return out


def _resolve(target, project, root_path, rel):
    if not project:
        raise ValueError("No project open")
    base = os.path.realpath(root_path)
    parts = [p for p in str(rel or "").split("/") if p]
    for part in parts:
        if part in (".", "..") or part.startswith(".") or "\\" in part:
            raise ValueError(f"Path not allowed: {rel}")
    folder = os.path.join(base, *parts)
    if not _inside(base, folder):
        raise ValueError(f"Path not allowed: {rel}")
    return base, folder, "/".join(parts)


def _scan_images(base, folder, with_dirs):
    dirs, files = [], []
    with os.scandir(folder) as found:
        for entry in found:
            name = entry.name
            if name.startswith("."):
                continue
            try:
                if entry.is_dir():
                    if with_dirs and _inside(base, entry.path):
                        dirs.append({"name": name, "dir": True})
                    continue
                if os.path.splitext(name)[1].lower() not in IMG_EXT:
                    continue
                if not _inside(base, entry.path):
                    continue
                info = entry.stat()
            except OSError:
                continue
            files.append({"name": name, "size": info.st_size, "at": info.st_mtime})
    return dirs, files


def _list_images(target, project, root_path, rel):
    if root_path is None:
        dirs, files = [], []
        for sub, real in _proj_img_dirs(target, project):
            for one in _scan_images(real, real, False)[1]:
                one["name"] = f"{sub}/{one['name']}"
                files.append(one)
        clean = ""
    else:
        base, folder, clean = _resolve(target, project, root_path, rel)
        if not os.path.isdir(folder):
            raise FileNotFoundError(folder)
        dirs, files = _scan_images(base, folder, True)
    dirs.sort(key=lambda d: d["name"].lower())
    files.sort(key=lambda f: (-f["at"], f["name"].lower()))
    entries = dirs + files
    more = max(0, len(entries) - MAX_LIST)
    return clean, entries[:MAX_LIST], more


class _ThumbCache:

    def __init__(self, size: int) -> None:
        self._size = size
        self._data: OrderedDict = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            hit = self._data.get(key)
            if hit is not None:
                self._data.move_to_end(key)
            return hit

    def put(self, key, value) -> None:
        with self._lock:
            self._data[key] = value
            self._data.move_to_end(key)
            while len(self._data) > self._size:
                self._data.popitem(last=False)


def _make_thumb(path):
    from PIL import Image, ImageOps

    with Image.open(path) as img:
        width, height = img.size
        try:
            orient = img.getexif().get(0x0112, 1)
        except Exception:
            orient = 1
        if orient in (5, 6, 7, 8):
            width, height = height, width
        try:
            img.draft("RGB", (THUMB_BOX[0] * 2, THUMB_BOX[1] * 2))
        except Exception:
            pass
        small = ImageOps.exif_transpose(img)
        small.thumbnail(THUMB_BOX)
        if small.mode in ("RGBA", "LA") or (
            small.mode == "P" and "transparency" in small.info
        ):
            rgba = small.convert("RGBA")
            small = Image.new("RGB", rgba.size, (128, 128, 128))
            small.paste(rgba, mask=rgba.getchannel("A"))
        elif small.mode != "RGB":
            small = small.convert("RGB")
        buf = io.BytesIO()
        small.save(buf, "JPEG", quality=70, optimize=True)
    data = base64.b64encode(buf.getvalue()).decode("ascii")
    return "data:image/jpeg;base64," + data, width, height


def _thumbs(target, project, root_path, rel, names, cache):
    if root_path is None:
        subs = dict(_proj_img_dirs(target, project))
    else:
        base, folder, _ = _resolve(target, project, root_path, rel)
    out = {}
    for name in names:
        name = str(name)
        file = name
        if root_path is None:
            sub, _, file = name.partition("/")
            if sub not in subs:
                continue
            base = folder = subs[sub]
        if "/" in file or "\\" in file or file.startswith("."):
            continue
        if os.path.splitext(file)[1].lower() not in IMG_EXT:
            continue
        path = os.path.join(folder, file)
        if not _inside(base, path):
            continue
        try:
            info = os.stat(path)
        except OSError:
            continue
        key = (os.path.realpath(path), info.st_mtime_ns, info.st_size)
        hit = cache.get(key)
        if hit is None:
            try:
                hit = _make_thumb(path)
            except Exception as exc:
                _LOGGER.debug("Thumbnail failed for %s: %s", path, exc)
                hit = (None, 0, 0)
            cache.put(key, hit)
        out[name] = {"t": hit[0], "w": hit[1], "h": hit[2]}
    return out


def _clean_name(name):
    stem, ext = os.path.splitext(name)
    stem = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode("ascii")
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-") or "foto"
    return stem[:80] + ext.lower()


def _same_ext(a, b):
    norm = {".jpeg": ".jpg"}
    ea, eb = os.path.splitext(a)[1].lower(), os.path.splitext(b)[1].lower()
    return norm.get(ea, ea) == norm.get(eb, eb)


def _free_name(folder, name):
    stem, ext = os.path.splitext(name)
    match = re.match(r"^(.*)-(\d+)$", stem)
    if match:
        stem = match.group(1)
    num = 2
    while os.path.exists(os.path.join(folder, f"{stem}-{num}{ext}")):
        num += 1
    return f"{stem}-{num}{ext}"


def _copy_image(target, project, root_path, rel, name, as_name, overwrite):
    if root_path is None:
        raise ValueError("Copy only from Media folders")
    base, folder, _ = _resolve(target, project, root_path, rel)
    name = str(name)
    if "/" in name or "\\" in name or name.startswith("."):
        raise ValueError(f"Name not allowed: {name}")
    if os.path.splitext(name)[1].lower() not in IMG_EXT:
        raise ValueError(f"Unsupported image: {name}")
    src = os.path.join(folder, name)
    if not _inside(base, src) or not os.path.isfile(src):
        raise FileNotFoundError(name)
    if os.path.getsize(src) > MAX_IMG:
        raise ValueError(f"Image too large: {name}")
    return _place(target, project, src, name, as_name, overwrite, move=False)


def _place(target, project, src, name, as_name, overwrite, move):
    pdir = _project_dir(target, project)
    if not os.path.isdir(pdir):
        raise FileNotFoundError(project)
    ddir = os.path.join(pdir, IMG_DIR)
    if not _inside(os.path.realpath(pdir), ddir):
        raise ValueError(f"Folder not allowed: {IMG_DIR}")
    os.makedirs(ddir, exist_ok=True)
    out = str(as_name).strip() if as_name else _clean_name(name)
    if not SAFE_NAME.match(out) or out.startswith(".") or ".." in out:
        raise ValueError(f"Name not allowed: {out}")
    if not _same_ext(out, name):
        raise ValueError(f"The name must keep the photo's extension: {out}")
    dst = os.path.join(ddir, out)
    if not _inside(os.path.realpath(ddir), dst):
        raise ValueError(f"Name not allowed: {out}")

    rel_out = f"{IMG_DIR}/{out}"
    if os.path.realpath(src) == os.path.realpath(dst):
        return {"path": rel_out, "same": True}
    existed = os.path.exists(dst)
    if existed:
        if os.path.getsize(dst) == os.path.getsize(src) and filecmp.cmp(
            src, dst, shallow=False
        ):
            return {"path": rel_out, "same": True}
        if not overwrite:
            raise NameTaken(_free_name(ddir, out), out)
    fd, tmp = _new_tmp(dst)
    try:
        with os.fdopen(fd, "wb") as handle, open(src, "rb") as source:
            shutil.copyfileobj(source, handle)
        os.replace(tmp, dst)
    except BaseException:
        _tmp_drop(tmp)
        raise
    if move:
        _tmp_drop(src)
    return {"path": rel_out, "copied": True, "overwritten": existed}




def _looks_like(path, ext):
    with open(path, "rb") as fh:
        head = fh.read(32)
    ext = ext.lower()
    if ext in (".jpg", ".jpeg"):
        return head[:3] == b"\xff\xd8\xff"
    if ext == ".png":
        return head[:8] == b"\x89PNG\r\n\x1a\n"
    if ext == ".gif":
        return head[:6] in (b"GIF87a", b"GIF89a")
    if ext == ".webp":
        return head[:4] == b"RIFF" and head[8:12] == b"WEBP"
    if ext == ".avif":
        return head[4:8] == b"ftyp" and head[8:12] in (b"avif", b"avis")
    return False


class _Uploads:

    def __init__(self) -> None:
        self.items: dict[str, dict] = {}

    def stale(self, now: float) -> list[str]:
        old = [k for k, v in self.items.items() if now - v["at"] > UPLOAD_IDLE and not v["busy"]]
        return [self.items.pop(k)["path"] for k in old]


def _tmp_new():
    fd, path = tempfile.mkstemp(prefix="ada_studio_", suffix=".part")
    os.close(fd)
    return path


def _tmp_write(path, offset, data):
    with open(path, "r+b") as fh:
        fh.seek(offset)
        fh.write(data)


def _tmp_drop(*paths):
    for path in paths:
        try:
            os.remove(path)
        except OSError:
            pass


def _upload_finish(target, project, path, name, as_name, overwrite):
    if not _looks_like(path, os.path.splitext(name)[1]):
        raise ValueError(f"Content does not match a {os.path.splitext(name)[1]} image: {name}")
    result = _place(target, project, path, name, as_name, overwrite, move=True)
    if result.get("same"):
        _tmp_drop(path)
    return result


def _img_root(hass, root):
    if root in (None, "", "project"):
        return None
    roots = _media_roots(hass)
    if root not in roots:
        raise ValueError(f"Unknown source: {root}")
    return roots[root]


def _roots_info(hass):
    return [{"id": "project", "label": "progetto"}] + [
        {"id": key, "label": key.split(":", 1)[1]} for key in _media_roots(hass)
    ]


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/save",
        vol.Optional("project"): vol.Any(cv.string, None),
        vol.Optional("prev"): vol.Any(int, None),
        vol.Required("files"): vol.All(
            cv.ensure_list,
            [
                vol.Schema(
                    {
                        vol.Required("name"): cv.string,
                        vol.Required("content"): cv.string,
                    }
                )
            ],
        ),
    }
)
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return

    plan, err = _validate(msg["files"])
    if err:
        connection.send_error(msg["id"], "invalid_format", err)
        return

    project = msg.get("project")
    try:
        written = await hass.async_add_executor_job(
            _write_files, target, plan, project, msg.get("prev")
        )
    except ProjectConflict as exc:
        connection.send_error(msg["id"], "version_conflict", str(exc.current))
        return
    except FileNotFoundError as exc:
        connection.send_error(msg["id"], "not_found", f"Project not found: {exc}")
        return
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_path", f"Path not allowed: {exc}")
        return
    except OSError as exc:
        _LOGGER.error("Write failed: %s", exc)
        connection.send_error(msg["id"], "write_failed", str(exc))
        return

    connection.send_result(
        msg["id"], {"written": written, "folder": target, "project": project or ""}
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/preview",
        vol.Required("project"): cv.string,
        vol.Required("data"): cv.string,
    }
)
@websocket_api.async_response
async def ws_preview(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    text = msg["data"]
    if text.startswith("data:"):
        text = text.partition(",")[2]
    if len(text) > MAX_PREVIEW * 4 // 3 + 4:
        connection.send_error(msg["id"], "invalid_format", "Preview too large")
        return
    try:
        data = base64.b64decode(text, validate=True)
    except ValueError:
        connection.send_error(msg["id"], "invalid_format", "Preview is not base64")
        return
    if not data.startswith(b"\xff\xd8\xff") or len(data) > MAX_PREVIEW:
        connection.send_error(msg["id"], "invalid_format", "Preview is not a JPEG")
        return
    try:
        name = await hass.async_add_executor_job(
            _write_preview, target, msg["project"], data
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_path", str(exc))
        return
    except FileNotFoundError:
        connection.send_error(msg["id"], "not_found", "Project not found")
        return
    except OSError as exc:
        _LOGGER.error("Preview write failed: %s", exc)
        connection.send_error(msg["id"], "write_failed", str(exc))
        return
    connection.send_result(msg["id"], {"written": name})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "ada_studio/projects"})
@websocket_api.async_response
async def ws_projects(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    projects = await hass.async_add_executor_job(_list_projects, target)
    connection.send_result(msg["id"], {"projects": projects, "folder": target})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/project_open",
        vol.Required("project"): cv.string,
    }
)
@websocket_api.async_response
async def ws_project_open(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    try:
        content = await hass.async_add_executor_job(
            _read_project, target, msg["project"]
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_path", str(exc))
        return
    except FileNotFoundError:
        connection.send_error(msg["id"], "not_found", "Project not found")
        return
    except OSError as exc:
        connection.send_error(msg["id"], "read_failed", str(exc))
        return
    connection.send_result(msg["id"], {"project": msg["project"], "content": content})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/project_new",
        vol.Required("project"): cv.string,
        vol.Optional("from"): vol.Any(cv.string, None),
        vol.Optional("content"): vol.Any(cv.string, None),
    }
)
@websocket_api.async_response
async def ws_project_new(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    content = msg.get("content") or EMPTY_PROJECT
    if len(content.encode("utf-8")) > MAX_BYTES:
        connection.send_error(msg["id"], "invalid_format", "Project too large")
        return
    try:
        name = await hass.async_add_executor_job(
            _new_project, target, msg["project"], msg.get("from"), content
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_path", str(exc))
        return
    except FileExistsError:
        connection.send_error(msg["id"], "exists", "A project with this name already exists")
        return
    except FileNotFoundError:
        connection.send_error(msg["id"], "not_found", "Source project not found")
        return
    except OSError as exc:
        _LOGGER.error("Create failed: %s", exc)
        connection.send_error(msg["id"], "write_failed", str(exc))
        return
    connection.send_result(msg["id"], {"project": name})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/project_delete",
        vol.Required("project"): cv.string,
    }
)
@websocket_api.async_response
async def ws_project_delete(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    try:
        name = await hass.async_add_executor_job(
            _delete_project, target, msg["project"]
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_path", str(exc))
        return
    except FileNotFoundError:
        connection.send_error(msg["id"], "not_found", "Project not found")
        return
    except OSError as exc:
        _LOGGER.error("Delete failed: %s", exc)
        connection.send_error(msg["id"], "write_failed", str(exc))
        return
    connection.send_result(msg["id"], {"deleted": name})


IMG_SCHEMA = {
    vol.Required("project"): cv.string,
    vol.Optional("root"): vol.Any(cv.string, None),
    vol.Optional("path"): vol.Any(str, None),
}


def _img_error(connection, msg, exc) -> None:
    if isinstance(exc, FileNotFoundError):
        connection.send_error(msg["id"], "not_found", f"Non trovato: {exc}")
    elif isinstance(exc, ValueError):
        connection.send_error(msg["id"], "invalid_path", str(exc))
    else:
        _LOGGER.error("Image operation failed: %s", exc)
        connection.send_error(msg["id"], "read_failed", str(exc))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "ada_studio/files", **IMG_SCHEMA}
)
@websocket_api.async_response
async def ws_files(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    root = msg.get("root") or "project"
    try:
        root_path = _img_root(hass, root)
        clean, entries, more = await hass.async_add_executor_job(
            _list_images, target, msg["project"], root_path, msg.get("path")
        )
    except (OSError, ValueError) as exc:
        _img_error(connection, msg, exc)
        return
    connection.send_result(
        msg["id"],
        {
            "roots": _roots_info(hass),
            "root": root,
            "path": clean,
            "entries": entries,
            "more": more,
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/thumbs",
        **IMG_SCHEMA,
        vol.Required("names"): vol.All(
            cv.ensure_list, [cv.string], vol.Length(max=THUMB_BATCH)
        ),
    }
)
@websocket_api.async_response
async def ws_thumbs(hass: HomeAssistant, connection, msg) -> None:
    data = hass.data.get(DOMAIN) or {}
    target = data.get("target")
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    try:
        root_path = _img_root(hass, msg.get("root"))
        thumbs = await hass.async_add_executor_job(
            _thumbs,
            target,
            msg["project"],
            root_path,
            msg.get("path"),
            msg["names"],
            data["thumbs"],
        )
    except (OSError, ValueError) as exc:
        _img_error(connection, msg, exc)
        return
    connection.send_result(msg["id"], {"thumbs": thumbs})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/file_copy",
        **IMG_SCHEMA,
        vol.Required("name"): cv.string,
        vol.Optional("as"): vol.Any(cv.string, None),
        vol.Optional("overwrite", default=False): cv.boolean,
    }
)
@websocket_api.async_response
async def ws_file_copy(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    try:
        root_path = _img_root(hass, msg.get("root"))
        result = await hass.async_add_executor_job(
            _copy_image,
            target,
            msg["project"],
            root_path,
            msg.get("path"),
            msg["name"],
            msg.get("as"),
            msg["overwrite"],
        )
    except NameTaken as exc:
        connection.send_error(msg["id"], "name_taken", f"{exc.free}|{exc.taken}")
        return
    except (OSError, ValueError) as exc:
        _img_error(connection, msg, exc)
        return
    connection.send_result(msg["id"], result)


def _yaml_card(text):
    import yaml

    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as exc:
        mark = getattr(exc, "problem_mark", None)
        line = f"line {mark.line + 1}: " if mark is not None else ""
        raise ValueError(line + str(getattr(exc, "problem", "") or exc)) from exc
    if not isinstance(data, dict):
        raise ValueError("not a card: the YAML must be a map with type")
    if not isinstance(data.get("type"), str) or not data["type"].strip():
        raise ValueError("missing type")
    return json.loads(json.dumps(data, default=str))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/yaml",
        vol.Required("text"): vol.All(cv.string, vol.Length(max=65536)),
    }
)
@websocket_api.async_response
async def ws_yaml(hass: HomeAssistant, connection, msg) -> None:
    try:
        config = await hass.async_add_executor_job(_yaml_card, msg["text"])
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_yaml", str(exc))
        return
    connection.send_result(msg["id"], {"config": config})


def _upload_get(hass, connection, msg):
    item = (hass.data.get(DOMAIN) or {}).get("uploads")
    item = item.items.get(msg["id_upload"]) if item else None
    if not item or item["user"] != connection.user.id:
        connection.send_error(msg["id"], "not_found", "Unknown or expired upload")
        return None
    return item


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/upload_begin",
        vol.Required("project"): cv.string,
        vol.Required("name"): cv.string,
        vol.Required("size"): vol.All(int, vol.Range(min=1)),
    }
)
@websocket_api.async_response
async def ws_upload_begin(hass: HomeAssistant, connection, msg) -> None:
    data = hass.data.get(DOMAIN) or {}
    target = data.get("target")
    if not target:
        connection.send_error(msg["id"], "not_ready", "Integration not initialized")
        return
    uploads: _Uploads = data["uploads"]
    name = str(msg["name"])
    ext = os.path.splitext(name)[1].lower()
    if "/" in name or "\\" in name or ext not in IMG_EXT:
        connection.send_error(msg["id"], "invalid_path", f"Unsupported image: {name}")
        return
    if msg["size"] > MAX_IMG:
        connection.send_error(msg["id"], "too_big", f"Image too large: {name}")
        return
    old = uploads.stale(time.monotonic())
    if old:
        await hass.async_add_executor_job(_tmp_drop, *old)
    if len(uploads.items) >= UPLOAD_MAX_ACTIVE:
        connection.send_error(msg["id"], "busy", "Too many uploads in progress")
        return
    try:
        pdir = _project_dir(target, msg["project"])
        if not await hass.async_add_executor_job(os.path.isdir, pdir):
            raise FileNotFoundError(msg["project"])
        path = await hass.async_add_executor_job(_tmp_new)
    except (OSError, ValueError) as exc:
        _img_error(connection, msg, exc)
        return
    up_id = secrets.token_hex(8)
    uploads.items[up_id] = {
        "path": path,
        "size": msg["size"],
        "got": 0,
        "name": name,
        "project": msg["project"],
        "user": connection.user.id,
        "at": time.monotonic(),
        "busy": False,
    }
    connection.send_result(msg["id"], {"id": up_id, "chunk": UPLOAD_CHUNK})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/upload_chunk",
        vol.Required("id_upload"): cv.string,
        vol.Required("offset"): vol.All(int, vol.Range(min=0)),
        vol.Required("data"): str,
    }
)
@websocket_api.async_response
async def ws_upload_chunk(hass: HomeAssistant, connection, msg) -> None:
    item = _upload_get(hass, connection, msg)
    if item is None:
        return
    if item["busy"] or msg["offset"] != item["got"]:
        connection.send_error(msg["id"], "bad_offset", f"Atteso {item['got']}")
        return
    try:
        chunk = base64.b64decode(msg["data"], validate=True)
    except (ValueError, TypeError):
        connection.send_error(msg["id"], "invalid_data", "Invalid data")
        return
    if not chunk or len(chunk) > UPLOAD_CHUNK or item["got"] + len(chunk) > item["size"]:
        connection.send_error(msg["id"], "invalid_data", "Invalid chunk size")
        return
    item["busy"] = True
    try:
        await hass.async_add_executor_job(_tmp_write, item["path"], item["got"], chunk)
    except OSError as exc:
        _img_error(connection, msg, exc)
        return
    finally:
        item["busy"] = False
    item["got"] += len(chunk)
    item["at"] = time.monotonic()
    connection.send_result(msg["id"], {"got": item["got"]})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/upload_finish",
        vol.Required("id_upload"): cv.string,
        vol.Optional("as"): vol.Any(cv.string, None),
        vol.Optional("overwrite", default=False): cv.boolean,
    }
)
@websocket_api.async_response
async def ws_upload_finish(hass: HomeAssistant, connection, msg) -> None:
    target = _target(hass)
    item = _upload_get(hass, connection, msg)
    if item is None:
        return
    if item["busy"] or item["got"] != item["size"]:
        connection.send_error(msg["id"], "incomplete", "Upload incomplete")
        return
    item["busy"] = True
    try:
        result = await hass.async_add_executor_job(
            _upload_finish,
            target,
            item["project"],
            item["path"],
            item["name"],
            msg.get("as"),
            msg["overwrite"],
        )
    except NameTaken as exc:
        item["at"] = time.monotonic()
        connection.send_error(msg["id"], "name_taken", f"{exc.free}|{exc.taken}")
        return
    except (OSError, ValueError) as exc:
        _img_error(connection, msg, exc)
        return
    finally:
        item["busy"] = False
    hass.data[DOMAIN]["uploads"].items.pop(msg["id_upload"], None)
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "ada_studio/upload_cancel",
        vol.Required("id_upload"): cv.string,
    }
)
@websocket_api.async_response
async def ws_upload_cancel(hass: HomeAssistant, connection, msg) -> None:
    item = _upload_get(hass, connection, msg)
    if item is None:
        return
    hass.data[DOMAIN]["uploads"].items.pop(msg["id_upload"], None)
    await hass.async_add_executor_job(_tmp_drop, item["path"])
    connection.send_result(msg["id"], {})


class AdaStudioSaveView(HomeAssistantView):

    url = "/api/ada_studio/save"
    name = "api:ada_studio:save"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def post(self, request):
        user = request.get("hass_user")
        if user is None or not user.is_admin:
            raise Unauthorized()

        try:
            payload = await request.json()
        except ValueError:
            return self.json_message("Invalid JSON", 400)

        plan, err = _validate(payload.get("files"))
        if err:
            return self.json_message(err, 400)

        project = payload.get("project") or None
        prev = payload.get("prev")
        if prev is not None and not isinstance(prev, int):
            prev = None

        target = _target(self.hass)
        if not target:
            return self.json_message("Integration not initialized", 503)
        try:
            written = await self.hass.async_add_executor_job(
                _write_files, target, plan, project, prev
            )
        except ProjectConflict as exc:
            return self.json_message(f"version_conflict:{exc.current}", 409)
        except FileNotFoundError as exc:
            return self.json_message(f"Project not found: {exc}", 404)
        except ValueError as exc:
            return self.json_message(f"Path not allowed: {exc}", 400)
        except OSError as exc:
            _LOGGER.error("Write failed: %s", exc)
            return self.json_message(f"Write failed: {exc}", 500)

        return self.json(
            {"written": written, "folder": target, "project": project or ""}
        )
