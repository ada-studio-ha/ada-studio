# Your first project

From a picture to a live dashboard: a room that lights up when its light turns on, a label with the temperature, and a tap that switches the light.

[Rules, styles and Motion →](rules-styles-motion.md) · [Flows, Test and pages →](flows-test-pages.md)

---

## 1. Create the project

Open **Ada Studio** from the sidebar. The title menu (the project name at the top left, with ▾) holds all project commands. Choose **New project…** and type a name: lowercase letters, digits, `-` and `_`.

Each project is a folder under `config/www/ada_studio/<name>/`. Everything you upload goes there, so the folder is included in Home Assistant backups and you can copy it to another installation.

## 2. Choose the picture

The picture is the **background**. In the **Objects** tab, select the **background** row and use **+ layer**, then **Browse…** to pick an image:

- from the project folder,
- from Home Assistant **Media** (the file is copied into the project),
- or upload it from your device.

A photo of the house with the lights off, a floor plan, a 3D render: anything works. You can stack more layers (a night version, an overlay) and give each one its own look and rules.

Select the **project** row to set the canvas size. **aspect ratio** → *as background* matches the canvas to the picture.

## 3. Draw zones

The tools are in the second row at the top (visible in **Edit**):

| Tool | How |
| --- | --- |
| Freehand polygon | click to add points, **Enter** to close |
| Open line | like the polygon, left open; it can have arrows, dashes and a flow |
| Rectangle, circle, ring sector, regular polygon, callout | drag on the canvas |
| Home Assistant card | drag a rectangle, then pick the card |
| Value label, state icon | click where it goes |

Draw one zone over each room. Then:

- **Select** a zone to edit it; drag its points, or select a point and use the arrow keys (Shift for steps of 10).
- **Snap to** shapes, guides and grid from the top bar. Drag from the rulers to add guides.
- Give each zone a **name** in *Settings*: names show up everywhere, in rules and in Flows.
- Group zones with **Ctrl+G** (or *Group* in *Settings* with several selected). Groups can be nested, locked 🔒 and hidden 👁 while you work.

On a tablet: one finger pans, two fingers zoom, a tap selects, and only the selected item can be dragged. **Multi-select** (the first button above the Objects list) makes every tap add or remove.

## 4. Give the zone a look

A selected object has three tabs: **Settings · Look · Behavior**.

In **Look**:

- **+ photo** adds a photo clipped to the zone, for example the same room with the light on. Each photo has a name, a file (**Browse…**) and a position: *anchored to canvas* (it stays aligned with the background, the usual choice for "lit room" photos) or *follows shape*.
- **+ style** adds a style, **+ motion** adds a Motion. *new style* at the bottom of the menu creates one and opens it.

Objects without styles are transparent. A style can be a colour, a gradient, a pattern, a border, a glow, an opacity… The full list is in [Rules, styles and Motion](rules-styles-motion.md#styles).

The trick for a room that lights up: the zone shows the lit photo, and its base look is **opacity 0**. A rule raises the opacity when the light is on.

## 5. Make it react

In **Behavior**, choose **+ rule**. A rule reads **When → Then → On**:

1. **When**: **+ cause** → *condition*. Pick the entity (`light.kitchen`), the comparison and the value (`= on`). Confirm with ✓.
2. **Then look**: **+ style** → a style with opacity 1.
3. **On**: the selected zone is already there. **+ target** adds more objects or groups.
4. **Create**.

The rule is now in the **Rules** tab. While it is true, its look applies; when it turns false, the zone goes back to its base look. If the style has a **Transition**, the change fades.

A light with brightness can do more: a **value** rule can drive the opacity with the brightness (see [Values](rules-styles-motion.md#values)).

## 6. Show a value

Draw a **Value label**. In *Settings* set **show** to *value of an entity* and pick the entity: the label shows its state, with the decimals, prefix and suffix you choose (the unit is proposed for you). A label can also show an attribute.

A **State icon** shows a Material Design icon (`mdi:lightbulb`). A rule can change its symbol with *icon symbol* (`mdi:lightbulb-on`).

## 7. Add a tap

Select the zone, **Behavior** → **+ rule** → **+ cause** → *tap*. The zone is under **tap on**. In **Then** choose the **action**:

- **Switch** toggles an entity (lights, switches, covers, scripts…);
- **More info** opens the entity dialog;
- the others (**Apply style**, **Apply motion**, **Call service**, **Go to page**, **Navigate**) are described in [Taps and swipes](rules-styles-motion.md#taps-and-swipes).

Swipes (← → ↑ ↓) work the same way: they are causes in the same menu.

## 8. Check it with Test

Switch the view at the top from **Edit** to **Test**. The canvas behaves like the dashboard. On the left you can flip the light, move values and change the time of day, without touching your devices. **Release values** goes back to the real states. See [Test](flows-test-pages.md#test).

## 9. Publish

- **Save project** (Ctrl+S) saves to Home Assistant. If you open the same project on two devices, Ada Studio warns you instead of overwriting the other one.
- **Create dashboard** writes the files and adds a dashboard named after the project to the sidebar, with a full-screen panel view. If it already exists, it just opens it.
- After that, **Update dashboard** and a reload of the dashboard publish your changes.

To place the card yourself, see *Prefer to place the card yourself?* in the [README](../../README.md#getting-started).

---

### Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Ctrl+Z / Ctrl+Shift+Z | undo / redo |
| Ctrl+D | duplicate |
| Ctrl+G / Ctrl+Shift+G | group / ungroup |
| Delete | delete the selection (a group is only ungrouped) |
| Arrows (Shift) | move by 1 (10) |
| Enter | close a polygon; on a group, select its members |
| Esc | cancel, go up one group level, deselect |
| Double click | go into a group |
| Ctrl/Cmd + click | select a single shape inside groups |
| H or hold Space | pan |
| Shift+H / Shift+V | flip horizontally / vertically |
| + / − / 0 | zoom in / out / fit |
