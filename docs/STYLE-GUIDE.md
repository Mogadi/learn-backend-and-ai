# Study Path — detailed reusable design style guide

Public reference for this study map. Based on the complete HTML, CSS, inline SVG and rendering code in `index.html`, inspected on 7 November 2026 (Africa/Kigali), and the Devlab reference `style-reference.png`.

**Scope:** a reusable visual language for complete multi-page projects, not just this landing page. **Current** means implemented in the source. **Extension** means proposed reuse guidance, not an existing feature. Exact original CSS and responsive overrides are included in section 14. The page was not modified.

## Table of contents

1. [Principles and mood](#1-principles-and-mood)
2. [Colour tokens](#2-colour-tokens)
3. [Typography](#3-typography)
4. [Layout and spacing](#4-layout-and-spacing)
5. [Responsive rules](#5-responsive-rules)
6. [Components](#6-components)
7. [Illustration and icons](#7-illustration-and-icons)
8. [Motion](#8-motion)
9. [Accessibility](#9-accessibility)
10. [Voice and copy](#10-voice-and-copy)
11. [Applying this to a multi-page project](#11-applying-this-to-a-multi-page-project)
12. [No AI slop](#12-no-ai-slop)
13. [Review checklist](#13-review-checklist)
14. [Copy-paste CSS reference](#14-copy-paste-css-reference)

## 1. Principles and mood

**Simple, editorial, technical, approachable.** White space, regular-weight geometric headings and thin rules do the work. The experience is a useful publication/catalogue, not a glossy generic SaaS pitch.

- **Black and white base:** white canvas, near-black reading text, structural borders and filled primary actions.
- **Small colour accents:** red `#E8432F`, steel blue `#5b97b4`, pale blue `#d4e5e9`. Colour concentrates in illustration, not every control.
- **Full bleed:** the page fills the viewport edge to edge. No grey outer frame, body padding, floating sheet, maximum-width page wrapper or page shadow. Internal gutters provide breathing room.
- **Editorial hierarchy:** large left-aligned display, modest paragraph copy, small uppercase mono utility labels. Tight heading tracking; relaxed reading line-height.
- **Visible organisation:** 1px ink rules separate major regions; lighter `#999` rules join catalogue cells. Zero card gaps and square cells replace floating rounded shadow cards.
- **Purposeful exceptions:** pills are for actions, filters and compact labels; the illustration terminal has rounded corners. The rule is not “absolutely no curves.”
- **Content-led imagery:** show back-end/API/database/AI/security subjects rather than arbitrary abstract shapes. Other projects need their own relevant objects.
- **Honesty and utility:** actual resources, searchable content, working filters and real counts; no manufactured trust bars.

### Relationship to the Devlab reference

Keep its typographic contrast, split hero, restrained palette, black pill CTA, mono wordmark/navigation and ruled sections. Do **not** restore the reference image’s grey surround: the user explicitly removed it. Do not copy its avatar strip, company logos, claims or unrelated abstract objects. The current terminal/database/network artwork deliberately adapts the reference to this page’s subject. The current CSS has no texture/grain effects, despite texture in the reference.

## 2. Colour tokens

### Every CSS custom property

| Token | Exact current value | Role |
|---|---|---|
| `--ink` | `#101010` | Primary text, CTA, selected filters, structural rules |
| `--muted` | `#505050` | Descriptions, notes, metadata, footer |
| `--paper` | `#fff` | Body/page background |
| `--blue` | `#5b97b4` | Steel-blue illustration accent |
| `--pale` | `#d4e5e9` | Pale-blue illustration surfaces |
| `--red` | `#e8432f` | Sparse accent, hero-aside asterisk, SVG details |
| `--focus` | `#174c99` | Keyboard-focus outline |
| `--sans` | `"DM Sans",Arial,sans-serif` | Body text |
| `--display` | `"Space Grotesk",Arial,sans-serif` | Headlines, titles and stat figures |
| `--mono` | `ui-monospace,SFMono-Regular,Consolas,monospace` | Wordmark and utility type |

**Light only:** `:root` and HTML metadata declare light colour scheme. No dark palette, dark-mode media query or theme toggle exists. Do not claim a current dark theme. A future theme requires new documented values and contrast tests: swapping ink and paper alone leaves hard-coded white surfaces and badges incorrect.

### Literal colours outside the tokens

| Context | Background | Text / border |
|---|---|---|
| Default badge | `#fff` | text `#333`, border `#b0b0b0` |
| Beginner | `#e8f0f3` | text `#254c60`, border `#b8ccd7` |
| Intermediate | `#fff` | text `#333`, default border |
| Advanced | `#fff0ed` | text `#9b291c`, border `#d5aaa4` |
| No-link badge | `#f5f5f5` | text `#505050`, default border |
| Tab / pick hover | `#edf3f5` | existing ink |
| Search placeholder | white field | `#626262` |
| Course grid | white | rules `#999` |
| Skip link | `#fff` | `#101010` |
| Pill / selected tab | ink | `#fff` |

SVG fills repeat `#101010`, `#e8432f`, `#5b97b4`, `#d4e5e9` and `white` literally. Blue/pale tokens do not automatically control those literal SVG fills. When making reusable SVG components, tokenise fills explicitly if needed.

### Usage and approximate proportions

**Recommended, not measured:** approximately 85% white ground, 10% ink/neutral text and rules, 5% coloured detail across an ordinary content page. Actual proportions vary with content; this is an art-direction restraint, not a pixel quota. Illustration can contain more colour locally. Red should generally be rarer than blue/pale. Do not tint every section or give each route its own accent colour. Focus and genuine data/status indicators take priority over decorative quotas.

Use ink for normal links and headings. Use dark semantic badge text rather than small red/steel-blue text on white. Pale blue is a surface/illustration colour, not reading ink. Never rely only on colour for difficulty, availability, validity or selection.

### Starter tokens block — exact existing values

```css
:root {
  color-scheme: light;
  --ink: #101010;
  --muted: #505050;
  --paper: #fff;
  --blue: #5b97b4;
  --pale: #d4e5e9;
  --red: #e8432f;
  --focus: #174c99;
  --sans: "DM Sans", Arial, sans-serif;
  --display: "Space Grotesk", Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Consolas, monospace;
}
```

## 3. Typography

### Font loading

The current Google Fonts link is exactly:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
```

The source uses a stylesheet link, not CSS `@import`. If CSS import is necessary, the equivalent line is:

```css
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap");
```

Use one loading method, not both. The mono stack needs no downloaded font. The SVG terminal separately names `'DM Mono','JetBrains Mono',ui-monospace,monospace`; the first two are **not** loaded by that Google Fonts URL, so rendering depends on locally available fallbacks.

### Complete implemented type scale

`inherit` means the cascade applies; body is DM Sans 16px / 1.55 at normal weight. `normal` is intentionally not replaced by an invented numeric value. `font` shorthands without `/…` reset line-height to normal.

| Role | Family | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| Body | sans | 16px | normal | 1.55 | normal |
| Wordmark | mono | 15px | 700 | inherited 1.55 | normal |
| Navigation | mono | 11px | 500 | normal | .035em |
| Pill | mono | 11px | 500 | normal | .025em |
| Kicker | mono | 10px | 500 | normal | .08em |
| H1 | display | clamp(40px,4.75vw,68px) | 400 | 1.07 | -.055em |
| Hero star | display | 40px | normal | 1 | normal |
| Hero subcopy | sans | 14px | inherit | 1.65 | normal |
| Hero aside | sans | 11px | inherit | 1.55 | normal |
| Stat figure | display | 30px | inherit | 1.1 | -.04em |
| Stat label | sans | 12px | inherit | inherited 1.55 | normal |
| Intro H2 | display | 34px | 400 | 1.1 | -.04em |
| Intro subcopy | sans | 13px | inherit | inherited 1.55 | normal |
| Badge | mono | 10px | 500 | 1.35 | normal |
| Filter | mono | 10px | 500 | 1.4 | .02em |
| Search | sans | 16px | inherit | inherited 1.55 | normal |
| General H2 | display | 30px | 400 | 1.15 | -.035em |
| Note | sans | 13px | inherit | 1.55 | normal |
| H3 group label | mono | 11px | 500 | 1.3 | .04em |
| Pick number | mono | 12px | 400 | normal | normal |
| Pick title | display | 16px | 500 | 1.35 | normal |
| Pick supporting text | sans | 11px | inherit | 1.5 | normal |
| Card title / no-link title | display | 17px | 500 | 1.4 | -.02em |
| External arrow | sans | 14px | inherited title weight | inherited title line-height | inherited title tracking |
| Card metadata | sans | 11px | inherit | inherited 1.55 | normal |
| Description | sans | 13px | inherit | 1.55 | normal |
| Footer | mono | 11px | normal | 1.6 | normal |

**Responsive sizes:** at min-width 1600px H1 becomes 76px. At max-width 640px: wordmark 12px, nav 9px, H1 46px, kicker 9px, hero subcopy 13px, stat number 28px, intro H2 30px, general H2 27px. At max-width 350px H1 is 40px. Other type properties remain unless the exact CSS appendix says otherwise.

### Hierarchy and measure

Regular-weight display is deliberate: do not bold every heading. Tight negative tracking belongs to display/titles, not paragraphs. H1 measure is `13ch`, balanced wrapping; the source prevents breaking “back-end.” Hero copy measure is `45ch` (`39ch` on mobile). Intro copy, notes and descriptions use `65ch`; hero aside uses `20ch` until tablet removes that cap.

Use uppercase mono for short navigation, kickers, filters and H3 labels only. The literal wordmark is **`// Study path`**, with two slashes, a space and the name. `// The collection` echoes it once; do not prepend slashes to every heading. Stat figures and metadata use tabular numerals; pick numbers get a leading zero via `::before`. Number real sequences, not arbitrary decorative steps.

## 4. Layout and spacing

The reset applies `border-box` to elements and pseudo-elements. Body margin and padding are zero; `.page` minimum block size is `100vh`. There is no max-width wrapper. Full bleed describes the canvas and structural rules, not paragraphs touching the screen edges.

| Region | Exact current geometry |
|---|---|
| Header | min-height 76px; padding 12px 32px; flex space-between; gap 24px; bottom 1px ink rule |
| Nav | flex, centred items, gap 28px |
| Hero | grid `1.65fr 1fr`; bottom 1px ink rule |
| Hero copy | padding 60px 56px 44px 72px; min-height 478px; vertically centred, left aligned |
| Hero star | absolute left 27px, top 104px |
| Hero bottom | full width, margin-top 12px; flex space-between; gap 20px |
| Art panel | left ink rule; clipped overflow; min-width 0; absolute SVG fills panel |
| Stats | four equal columns, bottom ink rule |
| Stat | padding 24px 32px; flex column gap 2px; margin 0; neighbour left rules |
| Library | padding 48px 32px 64px; scroll-margin-top 20px |
| Library intro | two equal columns; gap 32px; bottom margin 30px |
| Legend | wrapping flex; right aligned; gap 8px |
| Toolbar | ink top/bottom rules; vertical padding 16px; bottom margin 32px |
| Toolbar inner | wrapping flex; gap 16px; space-between |
| Filters | flex-wrap; gap 6px; flex basis 620px |
| Search | flex basis 220px; max-width 300px |
| Section heading | top ink rule; top padding 38px; margins 42px 0 20px |
| First section heading | border 0, padding 0, top margin 0 |
| Subsequent group | top margin 38px |
| Picks | five equal columns; top/bottom rules; margins 24px 0 54px |
| Pick | padding 20px 18px; flex column gap 12px; neighbour left rules |
| Course grid | three `minmax(0,1fr)` columns; gap 0; top/left #999 rules |
| Course card | padding 24px; flex column gap 10px; bottom/right #999 rules |
| Footer | top ink rule; padding 24px 32px |

The hero split is approximately 62.3% / 37.7%, not 50/50. Preserve the actual `1.65fr 1fr` when copying it. `min-inline-size:0`, `minmax(0,1fr)` and title `overflow-wrap:anywhere` prevent long-content overflow.

### Spacing vocabulary

There are **no spacing custom properties** or strict 8px system in the source. Observed spacing values include 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 18, 20, 22, 24, 28, 30, 32, 34, 38, 40, 42, 44, 48, 54, 56, 60, 64 and 72px. Search/icon/star positioning includes other exact offsets recorded in the appendix.

For new work, a practical **recommended subset** is 8 / 12 / 16 / 18 / 20 / 24 / 32 / 48 / 64px, all taken from existing values. This is reuse guidance, not a claim that tokens already exist. Keep related content close and topics further apart rather than using identical padding everywhere.

## 5. Responsive rules

The main breakpoints are 1600 / 1000 / 640px; there is also a 350px narrow-screen safeguard.

### `min-width:1600px`

Hero copy minimum height 560px; H1 76px. Full bleed remains; no maximum-width shell appears.

### `max-width:1000px`

Hero remains split. Copy padding 44px 32px, min-height 440px. Hide the star. Hero bottom stacks with 18px gap and start alignment; aside max width becomes none. Picks become three columns: fourth loses left border; fourth and later gain top borders. Cards become two columns. Nav gap 18px.

### `max-width:640px`

- Header padding 12px 18px, gap 8px, min-height 68px. Nav gap 10px; hide `.nav-guide`. Header pill padding 9px 12px, min-height 40px.
- Hero one column; copy has no minimum height, padding 38px 24px 32px. H1 bottom margin 20px; kicker bottom margin 20px; subcopy max-width 39ch and bottom margin 20px. Hero bottom gap 16px, margin 0.
- Art loses left rule and gains top rule; height `min(108vw,420px)`. SVG has `object-fit:cover`, while its own `preserveAspectRatio="xMidYMid slice"` controls viewBox cropping. Some cropping remains possible.
- Stats two columns; padding 18px 24px. Third stat loses left border; third and later gain top borders.
- Library padding 32px 18px 40px. Intro one column, gap 20px. Legend left aligned.
- Toolbar inner gap 14px. Search max-width none.
- Picks one column; each becomes grid `25px 1fr`, padding 18px 12px, gap `6px 12px`. Supporting text is in column two. Top borders replace left borders.
- Cards one column; padding 22px 18px. Section-heading top padding 30px and top margin 34px. Footer padding 22px 18px. General pills min-height 44px; more-specific header pill remains 40px.

### `max-width:350px`

Hide `.nav-courses`; H1 40px; header horizontal padding 12px; nav gap 8px; header pill horizontal padding 10px. **Extension:** a multi-page app needs accessible compact navigation instead of hiding its only route links.

## 6. Components

Section 14 contains **complete copy-pasteable source CSS**, including every component below and all responsive overrides. The recipes below explain semantic usage; do not copy only base styles and forget their mobile cascade.

### Header and navigation

Use semantic header and labelled navigation, shared across routes. Source header is not sticky. Wordmark is an anchor with a 44px minimum height; nav links are 44px minimum height with underline on hover. The current home link goes to `#home`, because this is a single document. Multi-page reuse must point it to the real home route. Source has no current-route state; see section 11.

### Pill buttons

Dark ink fill, white text, 1px ink border, 999px radius, padding 12px 24px, minimum height 46px, mono 500 11px, uppercase, .025em tracking, internal gap 20px. Header variation: minimum height 40px, padding 10px 18px. Use anchors for navigation and buttons for actions. Current “Start learning” includes an aria-hidden ↗. There is no dedicated pill hover-fill rule in the source: do not invent one and describe it as current. Reserve pills for useful actions rather than every link.

### Hero

Use one H1, short supporting copy, one clear primary action and a subject-specific image. The copy-side star is decorative. The aside has a red ✳ inserted before it. Title width, asymmetrical padding and split proportions are important; do not replace them with a centred headline over a gradient blob. Interior pages need not repeat a 478px promotional introduction.

### Statistics

Current markup uses four `<dl class="stat">` units, each with a figure `<dt>` and label `<dd>`. Values are computed in JavaScript from real resources/categories/picks/linked items; em dashes are initial placeholders. Never copy the displayed counts as generic marketing claims. Omit the component if the new project has no useful figures.

### Picks and cards

Picks are whole-cell anchors with 01… numbering, title and supporting text. Course cards are `<article>` elements: only their linked titles are anchors, not the entire panel. Unavailable URLs produce non-link title text and a “no link” badge. Do not imply interactivity where it does not exist. External course links use `target="_blank"`, `rel="noopener noreferrer"`, an aria-hidden arrow and hidden “opens in new tab” text. Cards have no radius, gap or shadow. A three-column catalogue serves many comparable resources; it is not a compulsory three-feature marketing row.

### Chips, legend and filters

Badges are noninteractive metadata; legend explains them. Badge padding is 3px 8px (legend 5px 10px), radius 999px, mono 500 10px/1.35. Difficulty names and explicit no-link text matter more than tint. Filters have 40px minimum height, 9px 13px padding, radius 999px, mono 500 10px/1.4 and .02em uppercase tracking. Active is ink/white; hover is `#edf3f5`. Despite `.tabs`, source uses buttons with `aria-pressed`, not an ARIA tablist. Preserve that valid toggle model unless implementing a complete tab interaction pattern.

### Search and empty results

Square 1px ink-bordered input, minimum height 44px, padding 10px 14px 10px 38px, 16px reading text. A 15px icon sits left 13px, top 15px. The `type="search"` input has a real visually hidden label, not only placeholder copy. Search matches titles/descriptions within the current category. Empty result reads “No matches.” with 32px padding and a 1px ink border. **Extension:** add a polite results announcement and clear-filter action when useful, without a decorative empty-state illustration.

### Footer

Top ink rule, 24px 32px padding, mono 11px/1.6, muted text. Credit/provenance/update date should remain true. Do not copy Muhammad’s personal credit into unrelated work. New legal/help links may be necessary; an unrelated promotional mega-footer is not.

## 7. Illustration and icons

### Current SVG anatomy

`viewBox="0 0 440 480"`, `preserveAspectRatio="xMidYMid slice"`; white ground. A near-black terminal rotates −4 degrees around `(190,135)`. Its rectangle is `(36,58)`, 310×170, radius 12 SVG units. Three coloured status circles sit above 13px mono code labels: `$ python app.py`, `GET /api/courses 200`, `POST /embed 201`, `learning back-end + AI`. These are contextual illustration labels, not a live interface.

A blue cylinder represents the database; black connector strokes and network nodes represent AI; a red shield/check references security. Pale-blue background shape and small red edge forms provide movement without animation. Connectors/database/network outlines use `#101010` and stroke width 1.2 SVG units; dashed connectors use `3 5`. Network radii are 11 and 13 SVG units. Shield check is white, 5 units wide, round caps/joins. These are illustration values, not UI border specifications.

Search icon has 16×16 viewBox and 1.75-unit stroke, rendered 15×15px. Category emoji exist in the resource data but `.cat-icon{display:none}` hides them; visible emoji-led headings are not part of this style.

### Reusable rules

- Flat geometric SVG, crisp silhouettes and limited strokes; controlled overlap/rotation/cropping is welcome.
- Use the project’s real subject: ledger for finance, pipeline for deployment, index/shelf for a library. Do not paste the same terminal into unrelated projects.
- Limit fills to paper/ink/red/steel/pale. No rainbow nodes, gradients, glossy 3D stock assets, frosted panels or glow orbs. Current source has no grain/noise filter.
- Keep essential information outside decorative SVG. Current art is `aria-hidden="true"`, `focusable="false"`; if a future diagram conveys unique facts, add an accessible name/description and equivalent prose.
- Test crop at desktop/mobile. Do not put essential illustration labels near edges that slice can remove.
- Use arrows to indicate destination meaning, not as an ornament on every sentence. Keep star/asterisk motifs sparse; do not turn them into repeated sparkle badges.

## 8. Motion

Only within `prefers-reduced-motion:no-preference`: smooth HTML scrolling; `.pill,.tab,.pick` transition background/color for **150ms ease**; active pills and filters scale to **.96**. There is no transform transition specified, spring animation, entrance animation, parallax, animated network, scroll reveal or counting-stat animation.

Reduced-motion users get static behaviour because enhancements are opt-in under that query. Preserve this approach. New motion should clarify feedback/orientation, not animate every section to make the page feel “premium.” Exact motion snippet appears in section 14.

## 9. Accessibility

### Implemented provisions

Global visible keyboard focus is **3px solid `--focus`**, offset **4px**. Preserve it. Skip link appears on focus; its destination is the `#main` library section inside the main landmark, with `tabindex="-1"`. Script focuses that destination for `#main` links with `preventScroll:true`. Sections have heading/label relationships; search has a label; decorative art/icons/arrows are hidden. Filters keep `aria-pressed` in sync with selection. External links announce a new tab. Difficulty/missing-link meaning is written in text. Body and controls inherit consistent fonts; paragraphs have readable measures.

### Contrast and text size

Ink and muted text on white are strong reading pairs. Do not assume red/steel/pale pass for small text: they primarily serve art. Check actual foreground/background combinations against WCAG AA (4.5:1 normal text; 3:1 large text), and essential non-text control contrast where applicable. Fine #999 dividers are separators, not sufficient control affordances by themselves. Focus must remain visible on all surfaces.

Small 9–13px utility text is an exact source fact, not a blanket usability endorsement. For dense multi-page applications, test real readers, long translations, 200% zoom and 320px reflow; explicitly enlarge labels if necessary as a documented extension. Never lock zoom to preserve the composition.

### Tap targets: do not overclaim

Wordmark/nav links have 44px minimum height; hero pill 46px (44px mobile); search 44px; filters 40px; header pill 40px; card title links only 24px minimum height. Badges are not controls. Thus the page does **not** uniformly provide 44×44px targets. Recommended extension: aim for comfortable 44px targets where feasible, meet applicable target size/spacing requirements, and enlarge title hit areas without nested anchors or falsely clickable cards.

### Additional production checks

Recommended extensions, not existing implementations: polite live result count; clear form help/errors and state feedback; accessible compact navigation; route `aria-current`; no-script or server-rendered catalogue fallback (current content is JS-generated). Test keyboard order, screen-reader output, font-loading failure, forced colours and reduced motion. Do not clip focus outlines inside new overflow containers. A minimal aesthetic never justifies removing labels, validation explanations or focus indicators.

## 10. Voice and copy

Helpful study-editor voice: calm, concrete, clear and encouraging. Existing examples: “Start learning,” “Start here, in this order,” “Search courses…” and “No matches.” Name the subject and outcome, not a vague aspiration. Use short paragraphs and sentence case in prose/titles; uppercase is for short mono utility roles.

Prefer learn/build/search/save/read/deploy/compare. Button copy should name the actual action. Preserve factual provenance, working links and accurate dates. Do not invent students, completion rates, endorsements or job guarantees. Avoid “Unlock your potential,” “Supercharge your workflow,” “Seamless innovation,” “revolutionary,” “next-gen,” and generic “all-in-one” claims as filler. No individual word proves AI authorship; the problem is interchangeable, uninformative copy.

## 11. Applying this to a multi-page project

### Shared files and components

Recommended architecture, not files already implemented:

```text
styles/
  tokens.css       # exact :root values in section 2
  base.css         # reset, body, links, focus, hidden text, skip link
  typography.css   # shared roles and reading measures
  components.css   # header/footer, pills, cells, chips, input
  layouts.css      # templates and responsive rules
components/
  SiteHeader
  SiteFooter
  PageHeading
  SearchToolbar
  ResourceCard
pages/             # or routes/ in the chosen framework
assets/illustrations/
STYLE-GUIDE.md
```

Load tokens before base, typography, components and layouts, once from the application root. In plain HTML use ordered stylesheet links; in a framework import from the shared root layout. Do not duplicate `:root` blocks per route or copy header markup until labels drift. Keep a single source of navigation routes/labels. Treat this page as a visual specimen, not a monolithic HTML file to duplicate along with unrelated course data and scripts.

### Page templates

| Template | Keep | Adapt |
|---|---|---|
| Landing | Full-width shell, asymmetric hero, large title, specific SVG, dark primary pill | Explain actual product; use real evidence/stats or omit them |
| List / index | Compact heading, ruled toolbar, filters/search, joined catalogue cells | Real categories; no-result/loading/error states; pagination if necessary |
| Detail / article | Shared shell, regular display title, subdued metadata, reading measure | Single content-led column, real breadcrumbs/back link where useful; no compulsory promotional hero |
| Form / settings | Shared type, ink rules, square controls, clear labels, dark primary action | Related fields grouped by headings/rules; local help/error text; preserve values; no forced three-column form |
| Dashboard | Shared shell, real stats if useful, clear sections, tabular numbers | Tables/rows for comparable data; labelled charts with scarce colour; units and update times |
| 404 / unavailable | Same header/footer, concise heading, plain explanation | Useful home/search/back action; no fake metrics or generic astronaut illustration |

A reading column can use the existing `65ch` measure inside full-width ruled regions without reintroducing an outer sheet. A dashboard may use more horizontal room for data. Identity comes from tokens, hierarchy, rules and restraint—not “every route must have hero art and cards.”

### Header/footer and navigation states

Reuse header height, gutters, wordmark, nav type and footer styling. Change only route state and genuinely task-specific actions. Current page has hover underline but no active-route state. This **recommended extension** reuses that same visual language:

```css
/* Extension: not an existing index.html selector. */
.topnav a[aria-current="page"] { text-decoration:underline }
```

Set `aria-current="page"` on the current route. Use `aria-pressed` for filter toggles, not route navigation. Current-route state must not replace keyboard focus. On small screens introduce an accessible compact menu if routes do not fit; do not merely hide important destinations. Keep footer attribution/dates accurate, not copied decoration.

### Scarce accents across routes

Default headings, links, primary actions and normal surfaces to ink/paper. A new route does not earn a new palette. Keep meanings stable: do not make red “featured” in one view and “success” in another. Colour may concentrate in one purposeful drawing/data emphasis rather than every panel. Semantic badges are for genuine metadata, not busywork.

Review several routes side by side: a tiny accent repeated 30 times becomes dominant. Necessary focus/validation/data states override decorative quotas. Any new semantic colour requires a documented, contrast-tested extension; the current CSS has no success token. Preserve consistency without forcing information into the wrong component.

### Adding new component families

Tables, dialogs, forms and charts inherit existing fonts, ink/paper, focus and spacing first. Specify behaviour, labels and responsive transformations before adding ornament. Clearly document new values instead of claiming they were extracted from the source. Do not import a stock UI kit’s radius/shadows/gradients unchanged and call it this style.

## 12. No AI slop

> **Do not use AI slop clichés.** Design from the actual content, user tasks and this chosen reference. Do not generate a stock landing template and merely recolour it.

### Definition

“AI slop design” is an informal critical label, not a measurable aesthetic category or proof of authorship. Here it means low-intention, interchangeable interface output: stock patterns, vague copy and decorative polish assembled without product-specific hierarchy, evidence or user needs. Humans can produce it; AI-assisted work can avoid it. A font, gradient, icon or card is not inherently wrong and does not prove AI made the page.

The opened practitioner articles describe convergence: a vague request for “modern, clean, premium” UI tends to invite common template patterns rather than clear art direction. Their explanations about training data are author interpretations, not controlled findings established by this guide. Treat the lists as useful review prompts, not universal claims about every tool.

### What AI tends to do without direction

| Reported default | Why it is weak when unchosen | Intentional alternative here |
|---|---|---|
| Purple/blue or indigo gradient, glowing orb, gradient text | Generic shorthand for “modern software” | Flat white ground, ink hierarchy, sparse fixed red/blue accents |
| Inter everywhere | No intentional distinction between roles | Space Grotesk display, DM Sans body, mono utility |
| Centred hero, sparkle pill, two CTAs, logo strip, three features, testimonials/pricing | Template dictates the story before content | Split introduction, subject-specific drawing, real study collection |
| Rounded-2xl identical icon cards, nested panels, soft shadows | Everything has the same hierarchy | Square joined cells, rules, rows/tables where appropriate |
| Glassmorphism and blurred blobs | Decorative depth without a reason | Opaque surfaces and clear structural rules |
| Emoji-heavy chrome, rocket/lightning/shield icons everywhere | Generic symbols substitute for the subject | Minimal functional icons and contextual technical SVG |
| “Unlock / Supercharge / Seamless,” “all-in-one” | Could sell anything | Name the actual task and result |
| Fake “Trusted by 10,000+ teams,” placeholder logos, invented testimonials/stats | Fabricated credibility, not merely bad styling | Real computed counts, verifiable evidence or no claim |
| Fade-up on every section, count-up metrics | Motion as filler | Small feedback transitions, reduced-motion support |
| Excessive sparkle/pill badges above headings | Chrome competes with useful content | Plain short kicker only when useful; semantic metadata only |

Regards documents emoji/icons, generic card arrangements, copy and glass defaults. Weekend MVP specifically names rounded-2xl, sparkle pills, fake trust bars and “Unlock / Supercharge / Seamless.” Capital & Compute adds a crucial warning: **anti-AI styling can become another template**, including cream/terracotta, neon-on-black, newspaper hairlines, mono labels and all-caps eyebrows.

That warning applies here too. Hairlines and mono labels are appropriate because the user deliberately chose the Devlab editorial direction for a study catalogue. They are not universal cures. Do not add slashes, kickers, arrows and numbered sequences to every heading. The security shield in this hero is justified by actual security study content; the problem is meaningless universal use, not the shield shape itself. The catalogue’s three-column grid is justified by comparable resources, not a compulsory three-feature sales row.

### What AI should be used to do

Use AI as a constrained production and critique assistant: inspect existing code, extract tokens, propose content-specific templates, scaffold consistent components, draft relevant SVGs, help check accessibility/responsiveness, and compare rendered output with explicit references. Give it actual content and this guide first. Keep human judgement over hierarchy, audience, claims and final review.

Do not let AI invent facts, testimonials or users; choose a random generic brand; or replace missing information with polished filler. Generated code still needs functional, accessibility and visual testing. “Make it less AI” alone is not an art direction: give a positive design brief, constraints and a meaningful reference, then inspect the result.

### Do / don’t checklist

| Do | Don’t |
|---|---|
| Start every route from the same exact tokens and shell | Regenerate palette and fonts separately per page |
| Keep white edge-to-edge with internal gutters | Restore a grey frame, floating sheet or shadow |
| Use regular, tightly tracked display hierarchy | Colour one arbitrary headline word or add gradient text |
| Draw objects relevant to the product | Insert a robot/blob/rocket into every hero |
| Reserve pills for real actions/filters/metadata | Put a pill label above every heading |
| Use semantic badges only when useful | Add “AI-powered,” “new,” or “premium” chrome as filler |
| Use catalogue cells, rows or tables as content demands | Force three feature cards onto every page |
| Number actual ordered beginner picks | Decorate unordered content with fake sequences |
| Compute or verify numbers and provenance | Invent social proof, testimonials, logos or guarantees |
| Write “Search courses” or a specific equivalent | Write “Unlock seamless possibilities” |
| Preserve labels/focus/reduced motion | Remove usability to make the page look sparse |
| Review all route types side by side | Polish only the landing and let interior pages become stock UI |

### Sources actually opened

Read on **7 November 2026 (Africa/Kigali)**. These are practitioner commentary, not quantitative prevalence studies. Only the following three pages were used as opened web sources; links they reference were not independently opened/verified.

- Filip Wojda, regards.design, [How to make a website look less vibe coded (and less AI)](https://www.regards.design/blog/make-website-look-less-vibe-coded), 21 October 2026. Pattern list; deliberate type/colour/layout/density/tone; references and comparison; individual traits are not inherently bad.
- John Iseghohi, Weekend MVP, [Why AI-Built Apps All Look the Same (and How to Fix It)](https://www.weekendmvp.app/articles/why-ai-built-apps-look-the-same), 6 November 2026. Specific rounded-card, sparkle-pill, fake-social-proof and vague-copy examples; shared-token guidance. Article discloses affiliate links.
- Capital & Compute, [How to Fix AI Slop in Web Design, Tell by Tell](https://capitalandcompute.net/blog/fix-ai-slop-design/), 25 September 2026. First/second-wave clichés; positive direction versus ban lists; cross-page consistency; visual checks do not verify claims.

## 13. Review checklist

- [ ] Actual content and tasks determine template, hierarchy and illustration.
- [ ] Exact fonts/tokens load once, with fallbacks.
- [ ] No grey surround, accidental max-width sheet or floating shadow cards.
- [ ] Ink structural rules and #999 catalogue boundaries remain distinct.
- [ ] Accent colour stays scarce across all routes, not only one component.
- [ ] Counts, dates, links and claims are genuine.
- [ ] One H1, useful headings, real labels and meaningful link names.
- [ ] Unavailable resources and empty/error/loading states are honest.
- [ ] Review around 1600, 1000, 640, 350px and ordinary desktop/mobile widths.
- [ ] Test keyboard/focus, contrast, screen readers, zoom/reflow, touch targets and reduced motion.
- [ ] Compare route families together; prevent generic-template drift.
- [ ] Document new features/values as extensions, not extracted source facts.

## 14. Copy-paste CSS reference

The following is the **complete primary source style block**, verbatim, including all components and media queries. Copy relevant component groups with their responsive overrides, or use this as the baseline then split into the shared files described above. Do not paste duplicate versions blindly: cascade and specificity matter.

```css
:root{color-scheme:light;--ink:#101010;--muted:#505050;--paper:#fff;--blue:#5b97b4;--pale:#d4e5e9;--red:#e8432f;--focus:#174c99;--sans:"DM Sans",Arial,sans-serif;--display:"Space Grotesk",Arial,sans-serif;--mono:ui-monospace,SFMono-Regular,Consolas,monospace}
*,*::before,*::after{box-sizing:border-box}
html{scroll-padding-block-start:24px}
body{margin:0;padding:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
.page{min-block-size:100vh;background:var(--paper)}
a{color:inherit;text-underline-offset:4px}
button,input{font:inherit}
:focus-visible{outline:3px solid var(--focus);outline-offset:4px}
.visually-hidden,.search label{position:absolute;inline-size:1px;block-size:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.skip{position:fixed;inset-block-start:8px;inset-inline-start:8px;z-index:100;background:#fff;color:#101010;padding:12px 20px;transform:translateY(-160%);border:1px solid}
.skip:focus{transform:translateY(0)}
.site-header{min-block-size:76px;padding:12px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-block-end:1px solid var(--ink)}
.wordmark{white-space:nowrap;font-family:var(--mono);font-size:15px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;min-block-size:44px}
.topnav{display:flex;align-items:center;gap:28px}
.topnav a{min-block-size:44px;display:inline-flex;align-items:center;text-decoration:none;font:500 11px var(--mono);text-transform:uppercase;letter-spacing:.035em}
.topnav a:hover{text-decoration:underline}
.pill{white-space:nowrap;display:inline-flex;min-block-size:46px;align-items:center;justify-content:center;gap:20px;background:var(--ink);border:1px solid var(--ink);border-radius:999px;color:#fff;padding:12px 24px;text-decoration:none;font:500 11px var(--mono);letter-spacing:.025em;text-transform:uppercase}
.topnav .pill{min-block-size:40px;padding:10px 18px}
.hero{display:grid;grid-template-columns:1.65fr 1fr;border-block-end:1px solid var(--ink)}
.hero-copy{position:relative;padding:60px 56px 44px 72px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-block-size:478px}
.kicker{font:500 10px var(--mono);letter-spacing:.08em;text-transform:uppercase;margin:0 0 22px}
h1{font-family:var(--display);font-size:clamp(40px,4.75vw,68px);font-weight:400;line-height:1.07;letter-spacing:-.055em;margin:0 0 22px;max-inline-size:13ch;text-wrap:balance}
.hero-star{position:absolute;inset-inline-start:27px;inset-block-start:104px;font:40px/1 var(--display)}
.hero-sub{font-size:14px;line-height:1.65;max-inline-size:45ch;margin:0 0 28px}
.hero-bottom{display:flex;align-items:center;justify-content:space-between;gap:20px;inline-size:100%;margin-block-start:12px}
.hero-aside{font-size:11px;max-inline-size:20ch;line-height:1.55;margin:0}
.hero-aside::before{content:"✳";color:var(--red);margin-inline-end:7px}
.hero-art{border-inline-start:1px solid var(--ink);position:relative;overflow:hidden;min-inline-size:0}
.hero-art svg{display:block;inline-size:100%;block-size:100%;position:absolute;inset:0}
.stats{display:grid;grid-template-columns:repeat(4,1fr);border-block-end:1px solid var(--ink)}
.stat{padding:24px 32px;display:flex;flex-direction:column;gap:2px;margin:0}
.stat+.stat{border-inline-start:1px solid var(--ink)}
.stat dt{font-family:var(--display);font-size:30px;line-height:1.1;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.stat dd{margin:0;font-size:12px}
.library{padding:48px 32px 64px;scroll-margin-block-start:20px}
.library-intro{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start;margin-block-end:30px}
.library-intro h2{font-family:var(--display);font-size:34px;font-weight:400;line-height:1.1;letter-spacing:-.04em;margin:0 0 14px;text-wrap:balance}
.sub{font-size:13px;color:var(--muted);max-inline-size:65ch;margin:0}
.legend{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
.badge{display:inline-flex;align-items:center;border:1px solid #b0b0b0;border-radius:999px;padding:3px 8px;font:500 10px/1.35 var(--mono);background:#fff;color:#333}
.legend .badge{padding:5px 10px}
.b-beg{background:#e8f0f3;color:#254c60;border-color:#b8ccd7}
.b-int{background:#fff;color:#333}
.b-adv{background:#fff0ed;color:#9b291c;border-color:#d5aaa4}
.b-nl{color:#505050;background:#f5f5f5}
.toolbar{border-block:1px solid var(--ink);padding-block:16px;margin-block-end:32px}
.toolbar-in{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.tabs{display:flex;flex-wrap:wrap;gap:6px;flex:1 1 620px}
.tab{border:1px solid var(--ink);border-radius:999px;min-block-size:40px;background:#fff;color:var(--ink);padding:9px 13px;font:500 10px/1.4 var(--mono);cursor:pointer;text-transform:uppercase;letter-spacing:.02em}
.tab:hover{background:#edf3f5}
.tab.active{color:#fff;background:var(--ink)}
.search{position:relative;flex:1 1 220px;max-inline-size:300px}
.search input{inline-size:100%;min-block-size:44px;border:1px solid var(--ink);background:#fff;color:var(--ink);border-radius:0;padding:10px 14px 10px 38px;font-size:16px}
.search input::placeholder{color:#626262}
.search-icon{position:absolute;inset-inline-start:13px;inset-block-start:15px;inline-size:15px;block-size:15px;pointer-events:none}
.section-head{padding-block-start:38px;margin-block:42px 20px;border-block-start:1px solid var(--ink)}
.section-head:first-child{border:0;padding:0;margin-block-start:0}
h2{font-family:var(--display);font-weight:400;line-height:1.15;letter-spacing:-.035em;font-size:30px;margin:0;text-wrap:balance}
.cat-icon{display:none}
.note{margin:8px 0 0;color:var(--muted);font-size:13px;max-inline-size:65ch;line-height:1.55}
h3{font:500 11px/1.3 var(--mono);letter-spacing:.04em;text-transform:uppercase;margin:30px 0 14px}
.group+.group{margin-block-start:38px}
.picks{display:grid;grid-template-columns:repeat(5,1fr);border-block:1px solid var(--ink);margin-block:24px 54px}
.pick{padding:20px 18px;display:flex;flex-direction:column;gap:12px;min-inline-size:0;text-decoration:none}
.pick+.pick{border-inline-start:1px solid var(--ink)}
.num{font:400 12px var(--mono);font-variant-numeric:tabular-nums}
.num::before{content:"0"}
.pick b{font-family:var(--display);font-size:16px;line-height:1.35;font-weight:500}
.pick small{font-size:11px;line-height:1.5;color:var(--muted);margin-block-start:auto}
.pick:hover{background:#edf3f5}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-block-start:1px solid #999;border-inline-start:1px solid #999}
.card{display:flex;flex-direction:column;gap:10px;padding:24px;min-inline-size:0;border-inline-end:1px solid #999;border-block-end:1px solid #999}
.card a,.title-nolink{font-family:var(--display);font-size:17px;line-height:1.4;letter-spacing:-.02em;font-weight:500;overflow-wrap:anywhere}
.card a{display:block;min-block-size:24px;text-decoration:none}
.card a:hover{text-decoration:underline}
.ext{white-space:nowrap;font-family:var(--sans);font-size:14px}
.t{display:flex;flex-wrap:wrap;align-items:center;gap:7px;color:var(--muted);font-size:11px;font-variant-numeric:tabular-nums}
.desc{font-size:13px;color:var(--muted);line-height:1.55;max-inline-size:65ch}
.empty{padding:32px;border:1px solid var(--ink)}
.site-footer{border-block-start:1px solid var(--ink);padding:24px 32px;font:11px/1.6 var(--mono);color:var(--muted)}
.hidden{display:none!important}
@media(prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}.pill,.tab,.pick{transition:background-color 150ms ease,color 150ms ease}.pill:active,.tab:active{transform:scale(.96)}}
@media(min-width:1600px){.hero-copy{min-block-size:560px}h1{font-size:76px}}
@media(max-width:1000px){.hero-copy{padding:44px 32px;min-block-size:440px}.hero-star{display:none}.hero-bottom{align-items:flex-start;flex-direction:column;gap:18px}.hero-aside{max-inline-size:none}.picks{grid-template-columns:repeat(3,1fr)}.pick:nth-child(4){border-inline-start:0}.pick:nth-child(n+4){border-block-start:1px solid}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.topnav{gap:18px}}
@media(max-width:640px){.site-header{padding:12px 18px;gap:8px;min-block-size:68px}.wordmark{font-size:12px}.topnav{gap:10px}.topnav a{font-size:9px}.topnav .pill{padding:9px 12px;min-block-size:40px}.topnav .nav-guide{display:none}.hero{grid-template-columns:1fr}.hero-copy{min-block-size:0;padding:38px 24px 32px}h1{font-size:46px;max-inline-size:13ch;margin-block-end:20px}.kicker{font-size:9px;margin-block-end:20px}.hero-sub{font-size:13px;max-inline-size:39ch;margin-block-end:20px}.hero-bottom{gap:16px;margin:0}.hero-art{border-inline-start:0;border-block-start:1px solid;block-size:min(108vw,420px)}.hero-art svg{object-fit:cover}.stats{grid-template-columns:repeat(2,1fr)}.stat{padding:18px 24px}.stat:nth-child(3){border-inline-start:0}.stat:nth-child(n+3){border-block-start:1px solid}.stat dt{font-size:28px}.library{padding:32px 18px 40px}.library-intro{grid-template-columns:1fr;gap:20px}.library-intro h2{font-size:30px}.legend{justify-content:flex-start}.toolbar-in{gap:14px}.search{max-inline-size:none}.picks{grid-template-columns:1fr}.pick{display:grid;grid-template-columns:25px 1fr;padding:18px 12px;gap:6px 12px}.pick small{grid-column:2}.pick+.pick{border-inline-start:0;border-block-start:1px solid}.grid{grid-template-columns:1fr}.card{padding:22px 18px}.section-head{padding-block-start:30px;margin-block-start:34px}h2{font-size:27px}.site-footer{padding:22px 18px}.pill{min-block-size:44px}}
@media(max-width:350px){.topnav .nav-courses{display:none}h1{font-size:40px}.site-header{padding-inline:12px}.topnav{gap:8px}.topnav .pill{padding-inline:10px}}
```

The document also contains this second visually-hidden helper, preserved verbatim:

```css
.visually-hidden{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
```
