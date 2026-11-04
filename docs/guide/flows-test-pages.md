# Flows, Test and pages

Seeing the logic, trying it out, and going beyond a single picture.

[← Your first project](first-project.md) · [← Rules, styles and Motion](rules-styles-motion.md)

---

The tabs at the top switch the view: **Edit · Test · Flows · Code**. The drawing tools are only in *Edit*.

## Flows

**Flows** draws every rule of the project as a chain: **cause → object → effect**.

- There is one box per main group of objects, with a box inside for each subgroup. Background layers and objects without a group have their own boxes. With pages, the boxes are in bands, one per page.
- On the left, **Find** searches causes, entities and objects. The list below has the **Flows** (one per box) and the **Causes**. A tap on a flow brings its box into view; a tap on a cause selects it and goes to the first box where it acts, and another tap to the next one.
- Hover over a node to light up its chain; a click keeps it selected, in red, and opens it on the right: the cause, the rule, the object or the style, ready to edit.
- Drag to move around, use the mouse wheel or two fingers to zoom, **Fit** to see everything. The minimap in the corner can be tapped or dragged.

Flows is the quickest way to answer "what does this sensor do?" or "why does this room turn blue?".

## Test

**Test** turns the canvas into the dashboard, with your real Home Assistant states, and lets you change them **without touching your devices**.

- The **When** column on the left lists the causes used on the current page: conditions have a switch, values a slider. Change them and the canvas reacts as the dashboard will. A simulated value is red.
- The first row is the **time**: tap it for a 24-hour slider, the exact time, the day, ▶ to play the day at 10 minutes per second, and ↺ to go back to now. The sun, date and time sensors, time-of-day ranges, schedules and calendars follow it, so you can watch a whole day and night.
- **Drag a cause** from *When* onto an object on the canvas to start a new rule with that cause and that object.
- **Taps** do what they will do on the dashboard: *Apply style* and *Apply motion* run, *Go to page* changes page with its transition, *More info* opens the dialog. *Switch*, *Call service* and *Navigate* do nothing in Test.
- The panel on the right is the same as in *Edit*: you can fix a rule or a style and see the result at once.
- **Release values** (top bar) brings every simulated entity back to its real state.

Simulated values are saved with the project but never written to the dashboard.

## Code

**Code** shows the files that **Update dashboard** writes: **SVG**, **YAML**, **CSS** and **Config**, with **Copy** and **Download**. You never need to edit them, but they are handy to see exactly what ha-floorplan receives.

---

## Pages

One project can hold several pages (home, climate, lights, cameras…) sharing the same background and size.

- **New page**: from the title menu the first time. Then the page name appears next to the project name, and its menu lists the pages, with **New page**, **Delete page…** and **Copy link**.
- Select the page row (▭) in **Objects** to set its **name**, its **address** and its **entry** transition. The address is what comes after `#` in the dashboard URL (`/my-house/0#climate`), so a page can be opened directly or from another dashboard. Renaming a page does not change its address.
- The page **size** is the same for all pages (**project** row → *page width*, *page height*). Each page has its own **x** and **y**, so it can show a different part of a large picture.
- Each object belongs to a page or to **all pages** (*Settings* → **page**). Objects on *all pages* (a menu bar, a clock) are drawn on top of every page.
- Move between pages with a tap rule and the **Go to page** action. The first page in the list is the one the dashboard opens.

In *Edit*, *Rules* and *Test* show the current page plus *all pages*.

## Background layers

Select the **background** row in **Objects**:

- **Fit type**: *stretch*, *contain* or *cover*;
- **+ layer** adds a picture on top of the previous one. Each layer has its file (**Browse…**), a **Base look** and its **Rules**. A night photo of the whole house on a layer, with a rule that fades it in after sunset, is the simplest day-and-night dashboard.

Layers only take condition rules.

## Home Assistant cards

The **Home Assistant card** tool places any Lovelace card, built-in or custom, on the picture. In *Settings* → **source**:

- **Visual**: the card picker and editor of Home Assistant;
- **YAML**: paste the card configuration;
- **Dashboard**: pick a card from one of your dashboards. It stays linked, so if you change it there, it changes here too.

Cards take styles, Motions and rules like any other object: hide a camera until motion is detected, or slide a card in with a tap.

In *Test* cards are shown but do not react to taps.
