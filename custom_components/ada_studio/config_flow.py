from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers import selector

from . import DEFAULT_FOLDER, DEFAULT_ICON, DEFAULT_TITLE, DOMAIN, bad_folder


class AdaStudioConfigFlow(ConfigFlow, domain=DOMAIN):

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title=DEFAULT_TITLE, data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return AdaStudioOptionsFlow()


class AdaStudioOptionsFlow(OptionsFlow):

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            folder = user_input.get("folder", "").strip().rstrip("/\\")
            if not folder or bad_folder(folder):
                errors["folder"] = "bad_folder"
            else:
                return self.async_create_entry(
                    data={
                        "folder": folder,
                        "sidebar_title": user_input.get("sidebar_title", "").strip() or DEFAULT_TITLE,
                        "sidebar_icon": user_input.get("sidebar_icon", "").strip() or DEFAULT_ICON,
                    }
                )
        cur = {**self.config_entry.options, **(user_input or {})}
        schema = vol.Schema(
            {
                vol.Required("folder", default=cur.get("folder", DEFAULT_FOLDER)): selector.TextSelector(),
                vol.Required(
                    "sidebar_title", default=cur.get("sidebar_title", DEFAULT_TITLE)
                ): selector.TextSelector(),
                vol.Required(
                    "sidebar_icon", default=cur.get("sidebar_icon", DEFAULT_ICON)
                ): selector.IconSelector(),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema, errors=errors)
