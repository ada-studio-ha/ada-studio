# Rules, styles and Motion

How a project comes alive: **styles** say how things look, **Motions** say how they move, **rules** say when.

[← Your first project](first-project.md) · [Flows, Test and pages →](flows-test-pages.md)

---

## Rules

A rule reads **When → Then → On**:

- **When**: one or more **causes**;
- **Then**: what happens;
- **On**: the objects, groups, cards or background layers it acts on. A group counts for all its members.

New rules start from **+ rule** in *Behavior* (with the selection already in *On*), or from **+** in the **Rules** tab. A new rule is a draft until you choose **Create**; it can only be created once it is complete.

### Causes

| Cause | What it is | The rule can… |
| --- | --- | --- |
| **condition** | an entity (or one of its attributes) compared with a value: `=`, `≠`, `>`, `≥`, `<`, `≤`, *between*. True or false | apply a look while it is true |
| **value** | the value of an entity or attribute, as a number | follow the value continuously |
| **tap**, **swipe ← → ↑ ↓** | a gesture on the dashboard | run an action |

The first cause decides the kind of rule. A condition rule can have several conditions, joined by **all true (AND)** or **any true (OR)**. A value or a gesture stays alone in its rule.

A cause is shared: change it once and every rule using it follows. Give it a name (*Night*, *Heating on*) and it reads better everywhere.

### Priority

The order in the **Rules** tab is the priority: **the first rule wins** where two rules disagree on the same object. Use ↑ ↓ in the toolbar to move a rule. *By cause* and *By object* only change how the list is grouped, not the priority.

A rule marked **⚠ incomplete** (a missing entity, style or target) is not written to the dashboard. The warning says what is missing.

### Handy tools

- **Replace entity…** (in *Behavior*) switches an entity in all the rules of the selection. Duplicate a room, then point the copy at the other room's devices.
- A copy (Ctrl+D) joins the rules of the original. *Replace entity…* separates it.
- **Placeholders**: in the entity picker type `@` and a name to create an entity that does not exist yet (`@boiler`), with an example state. You can build and try the project in **Test** with it; rules that use a placeholder are not written to the dashboard until you switch them to a real entity with *Replace entity…*.

---

## Conditions → a look

**Then look** works like the base look of an object:

- **+ style**: the styles to apply while the rule is true;
- **+ motion**: a Motion to play while the rule is true;
- **show photo**: on zones with several photos, which one to show (for example *day* or *night*);
- **icon symbol**: on state icons, the symbol to show (`mdi:lightbulb-on`).

When the rule turns false, the object goes back to its base look. A **Transition** in the style makes the change fade instead of jumping.

## Values

A value rule follows a number all the time. **Then → effect**:

| Effect | What it does |
| --- | --- |
| **drive motion** | puts a Motion at the point given by the value: *value* from → to maps onto the Motion from its first pose to its last. A needle that follows the setpoint, a curtain that follows the cover position, a room whose opacity follows the brightness |
| **motion speed** | the speed of a Motion follows the value (0 = stopped). A fan that turns faster with its speed |
| **flow speed** | on open lines, the speed and direction of the flowing dashes. Power going in or out |
| **gauge** | on open lines, how much of the line is drawn, in %. A progress bar or an arc |

**smooth** sets how many milliseconds the change takes when the value moves.

To show a value as **text**, use a Value label: *Settings* → **show** → *value of an entity*. Ada Studio writes the rule for you.

## Taps and swipes

A gesture rule lists under **tap on** (or **swipe → on**) the objects that react to the gesture. **Then → action**:

| Action | What it does |
| --- | --- |
| **Switch** | toggles the entity (`light.toggle`, `cover.toggle`…; buttons are pressed, scripts are run) |
| **More info** | opens the entity dialog of Home Assistant |
| **Apply style** | turns on some styles on some objects, until the dashboard is reloaded, on that device only. Menus, tabs, a "night mode" switch… with no helper entity |
| **Apply motion** | **play** runs a Motion from the start; **go to** moves it to a pose (in %) from where it is. The last gesture wins |
| **Call service** | calls any Home Assistant action, with an optional entity and data lines (`brightness_pct: 50`) |
| **Go to page** | shows another page of the project, with a transition: *fade*, *slide*, *zoom*, *rotate* |
| **Navigate** | opens another dashboard or view (`/lovelace/0`, `/my-dashboard/climate`) |

*Apply style* and *Apply motion* can be used together in the same rule: **+ action** adds the other one.

When several gesture rules touch the same object, they all run. Where they contradict each other, the first one wins, and a ⚠ marks the rule that loses something.

**tap passes through** (in *Behavior*) makes a zone ignore taps, so they reach the card or object underneath.

---

## Styles

The **Styles** tab lists every style with how many objects and rules use it. Group them with the folder button; styles nobody uses are listed under *unused*.

A style is made of sections, each with a checkbox. Only the sections you turn on are applied, so a style can do one thing (just a glow) and be combined with others.

| Section | Settings |
| --- | --- |
| **Fill** | *none*, *color*, *linear*, *radial* or *conic gradient*, *stripes*, *grid*, *dots*, *checks*, *image* (a photo or a texture, also tiled). A gradient or an image can be spread over the shape, its whole group or the canvas |
| **Border** | colour, width, *solid*, *dashed* or *dotted* (*Outline* on labels) |
| **Glow** | colour, blur, offset |
| **Opacity** | of the whole object |
| **Blend** | blend mode with what is underneath (*screen*, *multiply*…) |
| **Fade** | the zone's photo fades into transparency along a linear or radial gradient |
| **Transform** | move, rotate, scale |
| **Transition** | how long the change takes when the style turns on or off |
| **Text** | font, size, weight and alignment, for labels |

**Who wins:** in each list of styles (an object's *Look*, a rule's *Then look*, *Apply style*, a layer) **the last style wins**. Drag a row by pressing and holding it to change the order. A ⚠ on a row means another style overrides something in it.

## Motion

The **Motions** tab holds everything that moves.

- **Ready-made types**: *pulse*, *blink*, *fade in*, *color*, *heartbeat*, *spin*, *shake*, *bounce*, *wiggle*.
- **custom**: your own Motion made of **poses**. Each pose (0%, 100% and any you add with **+** in between) sets some properties: *move x*, *move y*, *rotate*, *scale*, *fill color*, *fill rotation*, *opacity*, *border width*, *border color*, *text size*, *letter spacing*. Double click a pose tab to change its time. **pivot** chooses the fixed point (nine positions), **easing** the pace, **back and forth** plays it forward then backward.

Every Motion has **duration**, **repeat** (forever or a number of times, then it stays at the end) and **delay**.

A Motion can be:

| Used in | It… |
| --- | --- |
| *Look* (**+ motion**) | always plays |
| *Then look* of a condition rule | plays while the rule is true |
| **drive motion** of a value rule | stands at the point given by the value |
| **Apply motion** of a tap rule | plays, or goes to a pose, at each tap |

The same Motion can be used in all these places: build a door that opens once, then let a sensor drive it or a tap play it.
