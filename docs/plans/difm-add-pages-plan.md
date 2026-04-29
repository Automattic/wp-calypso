# DIFM Add Pages – Alternative Implementation Plan

## Overview

Refactor the Express Website (DIFM) page-picker and website-content flow so that:

- Every selected page is a **unique instance** (Option A: unique ID per instance).
- **Single-only** types (no − / +): Home, Contact, Blog, Newsletter. **Shop** is store-flow-only and always a single row when present.
- **Multi-add** types use **− / +** steppers; multiplicity is shown by the **count**, not by changing the row label.
- Row **labels** use existing **`useTranslatedPageTitles()`** strings (e.g. “Services”, “Photo Gallery”, “Events”)—not a “singular (s)” suffix pattern.
- **Custom page** remains the **last** row in the ordered list.
- Data shape is consistent for frontend, cart, and API (no parallel `custom_page_titles` array; no “two Custom pages” special case).

---

## 1. Uniqueness (why Option A)

Previously, multiple custom pages shared the same `id` (`CUSTOM_PAGE`) and were distinguished only by array index and a parallel `customPageTitles` array. That caused:

- Lookups by `page.id` returning the wrong instance.
- Backend ambiguity if pages were keyed by id.
- Fragile reliance on index and a separate titles array.

**Option A:** Each selected page instance has a **unique `id`** (e.g. `HOME_PAGE`, `SERVICES_PAGE`, `SERVICES_PAGE_2`, `CUSTOM_PAGE`, `CUSTOM_PAGE_2`). No duplicate ids; no special handling for “multiple Custom pages.”

---

## 2. Page types and behaviour

Order below follows **`PAGE_TYPE_ORDER`** in `client/signup/difm/page-instances.ts`. In the **store** flow, **`SHOP_PAGE`** is inserted **immediately after Home** (`getPageTypeOrderForPicker( true )`).

| Page type | `PageId` constant | Multiple adds? | Label in Calypso (i18n) | Notes |
|-----------|-------------------|----------------|-------------------------|-------|
| Home | `HOME_PAGE` | No | Home | Required; always included |
| Shop | `SHOP_PAGE` | No | Shop | **Store flow only**; required row in that flow; single row |
| About | `ABOUT_PAGE` | Yes | About | − / + |
| Contact | `CONTACT_PAGE` | No | Contact | |
| Blog | `BLOG_PAGE` | No | Blog | |
| Photo gallery | `PHOTO_GALLERY_PAGE` | Yes | Photo Gallery | − / + |
| Video gallery | `VIDEO_GALLERY_PAGE` | Yes | Video Gallery | − / + |
| Services | `SERVICES_PAGE` | Yes | Services | − / + |
| Pricing | `PRICING_PAGE` | Yes | Pricing | − / + |
| Portfolio | `PORTFOLIO_PAGE` | Yes | Portfolio | − / + |
| FAQ | `FAQ_PAGE` | Yes | FAQ | − / + |
| Testimonials | `TESTIMONIALS_PAGE` | Yes | Testimonials | − / + |
| Team | `TEAM_PAGE` | Yes | Team | − / + |
| Careers | `CAREERS_PAGE` | Yes | Careers | − / + |
| Events | `EVENTS_PAGE` | Yes | Events | − / + |
| Donate | `DONATE_PAGE` | Yes | Donate | − / + |
| Newsletter | `NEWSLETTER_PAGE` | No | Newsletter | |
| Case studies | `CASE_STUDIES_PAGE` | Yes | Case Studies | − / + |
| **Custom page** | `CUSTOM_PAGE` | Yes | Custom Page | **Last**; − / +; per-instance **title** field in UI state |

---

## 3. Data shape spec

### 3.1 Selected pages (frontend state)

Single array of **`PageInstance`**: `{ id, type, title? }`. **`title`** is set for custom instances (user-editable; default placeholder in the picker).

```json
{
  "pageInstances": [
    { "id": "HOME_PAGE", "type": "HOME_PAGE" },
    { "id": "ABOUT_PAGE", "type": "ABOUT_PAGE" },
    { "id": "CONTACT_PAGE", "type": "CONTACT_PAGE" },
    { "id": "SERVICES_PAGE", "type": "SERVICES_PAGE" },
    { "id": "SERVICES_PAGE_2", "type": "SERVICES_PAGE" },
    { "id": "CUSTOM_PAGE", "type": "CUSTOM_PAGE", "title": "Tenderoo" },
    { "id": "CUSTOM_PAGE_2", "type": "CUSTOM_PAGE", "title": "Resources" }
  ]
}
```

- **`id`** – Unique per instance. First instance of a type uses the bare `type` string (e.g. `CUSTOM_PAGE`); further instances use `TYPE_2`, `TYPE_3`, … (see §3.5).
- **`type`** – Page template (for layout/pricing/backend). Can repeat.
- **`title`** – Used in UI for **custom** instances; persisted with **website content** `pages[]`, not sent on cart extras (see §3.2).

**Cart quantity / pricing:** length of the parallel **`selected_page_titles`** array (one entry per instance, same order), which duplicates `type` for each instance.

### 3.2 Cart / checkout payload (current Calypso)

`buildDIFMCartExtrasObject` (`client/state/difm/assemblers.ts`) sends:

- **`selected_page_titles`** – `PageId[]`: one entry per selected instance (e.g. two `"SERVICES_PAGE"` entries if the user added two Service pages). Used for tiered pricing / quantity.
- **`selected_page_instances`** – when non-empty: **`{ id, type }[]` only** (no `title`). Signup submit and one-click checkout map from full `PageInstance[]` with **`pageInstances.map( ( { id, type } ) => ( { id, type } ) )`**.

```json
{
  "selected_page_titles": [
    "HOME_PAGE",
    "ABOUT_PAGE",
    "CONTACT_PAGE",
    "SERVICES_PAGE",
    "SERVICES_PAGE",
    "CUSTOM_PAGE",
    "CUSTOM_PAGE"
  ],
  "selected_page_instances": [
    { "id": "HOME_PAGE", "type": "HOME_PAGE" },
    { "id": "ABOUT_PAGE", "type": "ABOUT_PAGE" },
    { "id": "CONTACT_PAGE", "type": "CONTACT_PAGE" },
    { "id": "SERVICES_PAGE", "type": "SERVICES_PAGE" },
    { "id": "SERVICES_PAGE_2", "type": "SERVICES_PAGE" },
    { "id": "CUSTOM_PAGE", "type": "CUSTOM_PAGE" },
    { "id": "CUSTOM_PAGE_2", "type": "CUSTOM_PAGE" }
  ],
  "site_title": "...",
  "new_or_existing_site_choice": "...",
  "is_store_flow": false
}
```

Custom display titles for multiple custom pages are **not** duplicated on this object; they live on **`PageInstance.title`** until the website-content step and in **`pages[].title`** for saves.

A backend may later accept optional **`title`** on each instance in this payload for fulfillment; the **current** Calypso client does not send it here.

### 3.3 GET website-content response

Example shape (API may evolve). **`pages`** is the source of truth for **content** and **per-page titles** (including custom page names).

```json
{
  "selected_page_instances": [
    { "id": "HOME_PAGE", "type": "HOME_PAGE" },
    { "id": "SERVICES_PAGE", "type": "SERVICES_PAGE" },
    { "id": "SERVICES_PAGE_2", "type": "SERVICES_PAGE" }
  ],
  "selected_page_titles": [ "HOME_PAGE", "SERVICES_PAGE", "SERVICES_PAGE" ],
  "pages": [
    { "id": "HOME_PAGE", "title": "Home", "content": "...", "useFillerContent": false, "media": [] },
    { "id": "SERVICES_PAGE", "title": "Service", "content": "...", "..." },
    { "id": "SERVICES_PAGE_2", "title": "Service", "content": "...", "..." }
  ],
  "is_website_content_submitted": false,
  "is_store_flow": false,
  "site_logo_url": "",
  "generic_feedback": "",
  "search_terms": ""
}
```

**Client normalization** (`use-get-website-content-query.ts`): if **`selected_page_instances`** is missing, instances are **`synthesizeInstancesFromTitles( selected_page_titles )`**. Selected instances are normalized to **`{ id, type }`** for dependency state; **`pages`** supplies titles and content per **`id`**.

- **`selected_page_instances`** (when present) – Order and identity; each `id` appears once.
- **`pages`** – Content keyed by the same **`id`**; one entry per instance.

### 3.4 PUT website-content (form save)

Same **`id`**-keyed **`pages`** as today; no structural change required beyond using the new ids.

```json
{
  "pages": [
    { "id": "HOME_PAGE", "title": "Home", "content": "...", "media": [], "..." },
    { "id": "CUSTOM_PAGE", "title": "Tenderoo", "content": "...", "..." }
  ],
  "site_logo_url": "...",
  "search_terms": "...",
  "generic_feedback": "..."
}
```

### 3.5 ID generation rules (frontend)

Implemented in **`nextInstanceId`**, **`buildInstancesForType`**, and **`synthesizeInstancesFromTitles`** (`page-instances.ts`).

- **First instance of a type:** `id` equals **`type`** (e.g. `HOME_PAGE`, `SERVICES_PAGE`, **`CUSTOM_PAGE`**).
- **Further instances:** **`TYPE_2`**, **`TYPE_3`**, … (e.g. `SERVICES_PAGE_2`, **`CUSTOM_PAGE_2`**). There is no `CUSTOM_PAGE_1` id—the first custom instance uses **`CUSTOM_PAGE`**.

---

## 4. Implementation summary

1. **Constants / types** – **`PageInstance`** (`id`, `type`, optional `title`) and signup dependencies carry **`selectedPageTitles`** (per-instance types for quantity) plus **`selectedPageInstances`** (`{ id, type }[]`) for stable ids.
2. **Labels** – **`useTranslatedPageTitles()`** for row labels; multi-add rows show a **numeric stepper**, not “(s)” suffixes on the label.
3. **Page-picker UI** – **`InstancePageSelector`**: one row per type; checkboxes for single-only types; − / + for multi-add; Custom last with per-instance title inputs. **`BrowserView`** / thumbnails may still reflect selection separately.
4. **Cart / assembler** – **`selected_page_titles`** always; **`selected_page_instances`** when the instances array is non-empty (see §3.2).
5. **Website-content** – **`pages`** keyed by **`id`**; section order follows **`pages`**; **`selected_page_instances`** or synthesized instances for ordering when needed.
6. **Backend** – Accept and return stable instance ids and **`pages`** by id; optional future: echo **`title`** on **`selected_page_instances`** in API responses if product needs it.
7. **Migration** – **`synthesizeInstancesFromTitles`** when the API returns only **`selected_page_titles`**.

---

## 5. Branch

Implementation branch: **`DIFM-add-custom`**

---

## 6. Push branch upstream & PR

`origin` is [Automattic/wp-calypso](https://github.com/Automattic/wp-calypso). Default branch is **`trunk`**.

1. **Commit** anything you want on the branch (check `git status` for uncommitted work).

2. From the clone:

   ```bash
   cd /Users/janmtm/Documents/WPDev/Calypso/wp-calypso
   git push -u origin DIFM-add-custom
   ```

   First push: **`-u`** sets upstream so later you can run `git push` / `git pull` on this branch without extra args.

3. On **GitHub**, open a PR: **base `trunk`** ← **compare `DIFM-add-custom`**, add a clear title/description, link **[HAPD-3498](https://linear.app/a8c/issue/HAPD-3498/submit-implementation-for-engineering-review)** (and the [Linear project](https://linear.app/a8c/project/reduce-friction-in-difm-content-form-f1599d4514a7/overview) if useful).
