# DIFM Add Pages – Alternative Implementation Plan

## Overview

Refactor the Express Website (DIFM) page-picker and website-content flow so that:

- Every selected page is a **unique instance** (Option A: unique ID per instance).
- **Home** and **Contact** are single-only (no multiple adds).
- All other page types can be added **multiple times** via − / + controls, including Custom page(s).
- Labels use **singular with (s)** where multi-add is allowed (e.g. "Event(s)", "Service(s)").
- **Custom page** remains the **last** option in the list.
- Data shape is consistent for frontend, cart, and API (no parallel `custom_page_titles` array; no "two Custom pages" special case).

---

## 1. Uniqueness (why Option A)

Previously, multiple custom pages shared the same `id` (`CUSTOM_PAGE`) and were distinguished only by array index and a parallel `customPageTitles` array. That caused:

- Lookups by `page.id` returning the wrong instance.
- Backend ambiguity if pages were keyed by id.
- Fragile reliance on index and a separate titles array.

**Option A:** Each selected page instance has a **unique `id`** (e.g. `HOME_PAGE`, `SERVICES_PAGE`, `SERVICES_PAGE_2`, `CUSTOM_PAGE_1`, `CUSTOM_PAGE_2`). No duplicate ids; no special handling for "multiple Custom pages."

---

## 2. Page types and behaviour

| Page type        | Multiple adds? | Label style   | Notes                    |
|------------------|----------------|---------------|--------------------------|
| Home             | No             | Home          | Single-only              |
| Contact          | No             | Contact       | Single-only              |
| About            | Yes            | About(s)       | − / +                    |
| Blog             | No             | Blog         | Single-only              |
| Service          | Yes            | Service(s)     | − / +                    |
| Event            | Yes            | Event(s)      | − / +                    |
| Testimonial      | Yes            | Testimonial(s)| − / +                    |
| Photo gallery    | Yes            | Photo(s)      | − / +                    |
| Video gallery    | Yes            | Video(s)      | − / +                    |
| Portfolio        | Yes            | Portfolio(s)  | − / +                    |
| FAQ              | Yes            | FAQ(s)        | − / +                    |
| Pricing          | Yes*           | Pricing / Pricing(s)* | *Decide if multi-add |
| Team             | Yes            | Team(s)       | − / +                    |
| Careers          | Yes            | Career(s)     | − / +                    |
| Donate           | Yes            | Donation(s)  | − / +                    |
| Newsletter       | No             | Newsletter   | Single-only              |
| Case studies     | Yes            | Case stud(y/ies) or Case Studies | − / + |
| **Custom page**  | Yes            | Custom page(s)| − / +; **last in list**; user-defined title per instance |

---

## 3. Data shape spec

### 3.1 Selected pages (frontend state / submit)

Single array of page instances. Each has a unique `id`, a `type`, and optional `title` (required for Custom).

```json
{
  "selectedPages": [
    { "id": "HOME_PAGE", "type": "HOME_PAGE" },
    { "id": "ABOUT_PAGE", "type": "ABOUT_PAGE" },
    { "id": "CONTACT_PAGE", "type": "CONTACT_PAGE" },
    { "id": "SERVICES_PAGE", "type": "SERVICES_PAGE" },
    { "id": "SERVICES_PAGE_2", "type": "SERVICES_PAGE" },
    { "id": "CUSTOM_PAGE_1", "type": "CUSTOM_PAGE", "title": "Tenderoo" },
    { "id": "CUSTOM_PAGE_2", "type": "CUSTOM_PAGE", "title": "Resources" }
  ]
}
```

- **`id`** – Unique per instance (e.g. `SERVICES_PAGE`, `SERVICES_PAGE_2`, `CUSTOM_PAGE_1`). Never duplicated.
- **`type`** – Page template (for layout/pricing/backend). Can repeat.
- **`title`** – Optional; **required** for `CUSTOM_PAGE`. Optional override for other types later if needed.

**Cart quantity:** `selectedPages.length`.

### 3.2 Cart / checkout payload

```json
{
  "selected_page_instances": [
    { "id": "HOME_PAGE", "type": "HOME_PAGE" },
    { "id": "ABOUT_PAGE", "type": "ABOUT_PAGE" },
    { "id": "CONTACT_PAGE", "type": "CONTACT_PAGE" },
    { "id": "SERVICES_PAGE", "type": "SERVICES_PAGE" },
    { "id": "SERVICES_PAGE_2", "type": "SERVICES_PAGE" },
    { "id": "CUSTOM_PAGE_1", "type": "CUSTOM_PAGE", "title": "Tenderoo" },
    { "id": "CUSTOM_PAGE_2", "type": "CUSTOM_PAGE", "title": "Resources" }
  ],
  "site_title": "...",
  "new_or_existing_site_choice": "...",
  "is_store_flow": false
}
```

(Backward compatibility: can keep existing `selected_page_titles` during migration and add `selected_page_instances` for the new shape.)

### 3.3 GET website-content response

```json
{
  "selected_page_instances": [
    { "id": "HOME_PAGE", "type": "HOME_PAGE", "title": "Home" },
    { "id": "ABOUT_PAGE", "type": "ABOUT_PAGE", "title": "About" },
    { "id": "CONTACT_PAGE", "type": "CONTACT_PAGE", "title": "Contact" },
    { "id": "SERVICES_PAGE", "type": "SERVICES_PAGE", "title": "Service" },
    { "id": "SERVICES_PAGE_2", "type": "SERVICES_PAGE", "title": "Service" },
    { "id": "CUSTOM_PAGE_1", "type": "CUSTOM_PAGE", "title": "Tenderoo" },
    { "id": "CUSTOM_PAGE_2", "type": "CUSTOM_PAGE", "title": "Resources" }
  ],
  "pages": [
    { "id": "HOME_PAGE", "title": "Home", "content": "...", "useFillerContent": false, "media": [] },
    { "id": "ABOUT_PAGE", "title": "About", "content": "...", "..." },
    { "id": "CONTACT_PAGE", "title": "Contact", "content": "...", "..." },
    { "id": "SERVICES_PAGE", "title": "Service", "content": "...", "..." },
    { "id": "SERVICES_PAGE_2", "title": "Service", "content": "...", "..." },
    { "id": "CUSTOM_PAGE_1", "title": "Tenderoo", "content": "...", "..." },
    { "id": "CUSTOM_PAGE_2", "title": "Resources", "content": "...", "..." }
  ],
  "is_website_content_submitted": false,
  "is_store_flow": false,
  "site_logo_url": "",
  "generic_feedback": "",
  "search_terms": ""
}
```

- **`selected_page_instances`** – Order and identity; each `id` appears once.
- **`pages`** – Content keyed by the same `id`; one entry per instance.

### 3.4 PUT website-content (form save)

Same `id`-keyed pages as today; no structural change required beyond using the new ids.

```json
{
  "pages": [
    { "id": "HOME_PAGE", "title": "Home", "content": "...", "media": [], "..." },
    { "id": "CUSTOM_PAGE_1", "title": "Tenderoo", "content": "...", "..." }
  ],
  "site_logo_url": "...",
  "search_terms": "...",
  "generic_feedback": "..."
}
```

### 3.5 ID generation rules (frontend)

- **First instance of a type:** `id` = type (e.g. `HOME_PAGE`, `SERVICES_PAGE`, `CUSTOM_PAGE` or `CUSTOM_PAGE_1`).
- **Additional instances:** append `_2`, `_3`, … (e.g. `SERVICES_PAGE_2`, `CUSTOM_PAGE_2`).

---

## 4. Implementation summary

1. **Constants / types** – Introduce `PageInstance` (id, type, title?) and list of instances instead of `selectedPageTitles` + `customPageTitles`.
2. **Labels** – Use singular with (s) for multi-add types; keep "Home" and "Contact" as-is (single-only).
3. **Page-picker UI** – One row per page type; − / + for multi-add types; no − / + for Home and Contact. Custom page(s) last. Per custom instance: user-defined title.
4. **Cart / assembler** – Send `selected_page_instances` (and optionally keep `selected_page_titles` for backward compat).
5. **Website-content** – Consume `selected_page_instances` and `pages` keyed by `id`; section order = instance order; section header = instance title.
6. **Backend** – Accept and return the new shapes; persist by unique `id`.
7. **Migration** – Map existing `selectedPageTitles` + `customPageTitles` to `selected_page_instances` where needed.

---

## 5. Branch

Implementation branch: **`DIFM-add-pages`**
