# DIFM Add Custom Pages – Test Plan

Test plan for the DIFM page-instances / custom-pages change: PR verification (automated + manual) and manual QA scenarios with credit calculation.

## UI on this branch (read first)

- **Page picker:** Thumbnail **grid** — click a tile to **add** that page type, click again to **remove** it (toggle), except where noted below.
- **No stepper** (− / + counts) in this branch; ignore older docs that mention steppers.
- **Home** is **always selected** (required, not removable).
- **Store flow (`do-it-for-me-store`):** **Shop** is **required** and **cannot be deselected** (same as Home). Clicks on those tiles do nothing by design.
- **Multiple Custom pages:** Use **Add a Custom Page** to add extra Custom instances; each can be removed individually.
- **Only one tile per non-Custom type** in the grid — you **cannot** pick two separate “Services” rows from the picker (no duplicate non-Custom instances). Scenarios below use **at most one** of each standard type plus **3× Custom** where needed.
- **Support session (A8C + HE):** Extra tiles **Custom Blog Page** and **Custom Shop Page** appear only when a support session is active **and** reader teams have loaded (Calypso fetches teams on this step so Automattician detection works). **Custom Shop Page** appears only in **non-store** flows (store flow uses the regular **Shop** row instead).
- **Not in the picker (by design):** **Careers** and **Case Studies** were removed from the grid per product guidance; they are **not** selectable in these manual tests.

## Progress (manual QA)

- **Tests 1–3:** Completed.
- **Test 4:** In progress.

---

## Part 1: Tests for the PR (ensure the change works)

### 1.1 Automated tests to add or run

| Area | What to test | Where / how |
|------|----------------|-------------|
| **Cart quantity** | Cart quantity = number of **page instances** (not unique types). E.g. 1 Home + 2 Custom with multi-custom = depends on selection; quantity matches `selectedPageInstances.length`. | Unit test in `client/lib/signup/step-actions` (or wherever `addDIFMLiteProductToCart` is tested): call with `selectedPageInstances` of length N and optionally `selectedPageTitles`; assert `cartItem.quantity === N`. |
| **Step actions** | When `selectedPageInstances` is present, `cartItem.quantity` uses `selectedPageInstances.length`; otherwise fallback to `selectedPageTitles.length`. | Same as above; test both branches. |
| **Assemblers** | `buildDIFMCartExtrasObject` sends `selected_page_instances` when provided; `selected_page_titles` still derived/sent. | Extend `client/state/difm/test/assemblers.ts`: add a test with `selectedPageInstances` and assert `selected_page_instances` in the output. |
| **Website content** | When `selectedPageInstances` exists, one PageData per instance (by `instance.id`); custom pages get distinct title/content. | `client/state/signup/steps/website-content` reducer/actions tests: assert generated pages match instances and custom titles. |
| **Page picker** | Selection state (toggles + custom adds) is saved and passed to the next step; defaults for Premium vs Store flow include required Home (and Shop in store). | Page-picker tests: assert initial state and that submit sends `selectedPageInstances` with correct length and types. |
| **Blog + Shop** | **Blog:** toggle on/off (at most one). **Shop (store):** always present, not toggled off. **Support Custom Blog/Shop:** visible only with A8C + support session + teams loaded; toggle like other optional types (non-store only for Custom Shop). | Integration or manual checks on `client/signup/steps/page-picker/index.tsx` behavior. |
| **Support custom rows** | `SUPPORT_SHOP_PAGE` / `SUPPORT_BLOG_PAGE` serialize in `selectedPageTitles` / `selectedPageInstances` when selected. | Assert payload shape when tiles are selected in a support session. |

**Note:** If `client/lib/signup/step-actions/index.js` still uses `dependencies.selectedPageTitles.length` for `cartItem.quantity`, it should use **page instances** for pricing (e.g. `dependencies.selectedPageInstances?.length ?? dependencies.selectedPageTitles?.length ?? 0`). Add a unit test that covers the instances path.

### 1.2 Manual PR smoke test (one flow)

1. Start DIFM flow (Premium path), go to page picker.
2. Toggle an optional page type (e.g. Blog) off and on; add **two Custom pages** via **Add a Custom Page** if available.
3. Confirm **Home** stays selected.
4. Proceed to checkout (no need to pay); confirm cart shows **Website Design Service** with quantity = total number of page instances.
5. If you have a content-collection step, confirm custom page titles appear in the payload where applicable.

---

## Part 2: Manual QA scenarios (four tests + one support-session add-on)

You run **four** manual tests: three **paid** (Premium, Business, E-commerce) and one **free** (Express + coupon). **All four tests** use the page picker and content form; only the free test uses a coupon so no credits are spent.

### Pricing (paid tests only)

- **Base price:** **USD 499.00** for **5 pages** (included).
- **Additional pages:** **USD 69.00** per page.
- **Formula:** `$499 + (total_pages - 5) × $69` when total_pages > 5.

### Page coverage across all four tests

- **Per test:** Exactly **10 pages** (7 named types + **3 Custom** with distinct titles). **Home** is always among the seven named selections (and is always on by default).
- **Goal:** Across Tests 1–4, **every** standard onboarding page type used in the grid is covered at least once (see `client/signup/difm/page-instances.ts` and store flow **Shop** in Test 3).
- **Custom page titles** (use these so you can verify in the content form):
  - Test 1: **Premium Custom 1**, **Premium Custom 2**, **Premium Custom 3**
  - Test 2: **Business Custom 1**, **Business Custom 2**, **Business Custom 3**
  - Test 3: **Store Custom 1**, **Store Custom 2**, **Store Custom 3**
  - Test 4: **Free Custom 1**, **Free Custom 2**, **Free Custom 3**

**Coverage (every standard type tested across the four tests):**

| Page type     | Test(s)   |
|---------------|-----------|
| Home          | 1, 3, 4   |
| About         | 1, 3, 4   |
| Contact       | 1, 3, 4   |
| Blog          | 1, 3, 4   |
| Photo Gallery | 1, 3      |
| Video Gallery | 1         |
| Services      | 1, 3      |
| Pricing       | 2         |
| Portfolio     | 2, 4      |
| FAQ           | 2         |
| Testimonials  | 2         |
| Team          | 2         |
| Events        | 2         |
| Donate        | 4         |
| Newsletter    | 4         |
| **Shop**      | 3 only    |
| **Custom × 3**| 1, 2, 3, 4 |

---

### Test 1: Premium plan (do-it-for-me flow)

- **Plan:** Premium.
- **Flow:** Do-it-for-me (non-store).
- **Pages (10 total):** 7 named + 3 Custom.
  - Included: 5 -> **Extra: 5 pages.**
  - **Cost:** $499 + 5 × $69 = **$844.**

**Exact page list (Test 1):**

| # | Page type       | Custom title (if Custom) |
|---|-----------------|---------------------------|
| 1 | Home            | -                         |
| 2 | About           | -                         |
| 3 | Contact         | -                         |
| 4 | Blog            | -                         |
| 5 | Photo Gallery   | -                         |
| 6 | Video Gallery   | -                         |
| 7 | Services        | -                         |
| 8 | Custom          | Premium Custom 1          |
| 9 | Custom          | Premium Custom 2          |
|10 | Custom          | Premium Custom 3          |

**Checklist:** [ ] **Home** remains selected. [ ] Select exactly these 10 pages (use **Add a Custom Page** for the three Custom rows). [ ] Cart quantity = 10, total **$844**. [ ] Checkout; content form shows all 10 and the three custom titles above.

---

### Test 2: Business plan (do-it-for-me flow)

- **Plan:** Business.
- **Flow:** Do-it-for-me (non-store).
- **Pages (10 total):** 7 named (including **Home**) + 3 Custom. **Cost:** **$844.**

**Exact page list (Test 2):**

| # | Page type     | Custom title (if Custom) |
|---|---------------|---------------------------|
| 1 | Home          | -                         |
| 2 | Pricing       | -                         |
| 3 | Portfolio     | -                         |
| 4 | FAQ           | -                         |
| 5 | Testimonials  | -                         |
| 6 | Team          | -                         |
| 7 | Events        | -                         |
| 8 | Custom        | Business Custom 1       |
| 9 | Custom        | Business Custom 2       |
|10 | Custom        | Business Custom 3       |

**Checklist:** [ ] **Home** remains selected. [ ] Select exactly these 10 pages (deselect default pages you do not need). [ ] Cart quantity = 10, total **$844**. [ ] Checkout; content form shows all 10 and the three custom titles above.

---

### Test 3: E-commerce plan (do-it-for-me-store flow)

- **Plan:** E-commerce (Business with store).
- **Flow:** Do-it-for-me-store.
- **Pages (10 total):** 7 named (must include **Shop**) + 3 Custom. **Cost:** **$844.**

**Exact page list (Test 3):**

| # | Page type     | Custom title (if Custom) |
|---|---------------|---------------------------|
| 1 | Home          | -                         |
| 2 | **Shop**      | -                         |
| 3 | About         | -                         |
| 4 | Contact       | -                         |
| 5 | Blog          | -                         |
| 6 | Photo Gallery | -                         |
| 7 | Services      | -                         |
| 8 | Custom        | Store Custom 1          |
| 9 | Custom        | Store Custom 2          |
|10 | Custom        | Store Custom 3          |

**Checklist:** [ ] **Home** and **Shop** are required (cannot deselect). [ ] Select exactly these 10 pages. [ ] Cart quantity = 10, total **$844**. [ ] Checkout; content form shows all 10 including Shop and the three custom titles above.

---

### Test 4: Free (Express + coupon)

- **Cost:** **$0** (coupon covers Express; no credits used).
- **Flow:** Same page picker and content form as the paid tests; checkout with coupon so the order is free.
- **Pages (10 total):** 7 named + 3 Custom. **Home must stay selected** — list below starts with Home, then the other six named types.

**Exact page list (Test 4):**

| # | Page type    | Custom title (if Custom) |
|---|--------------|---------------------------|
| 1 | Home         | -                         |
| 2 | Donate       | -                         |
| 3 | Newsletter   | -                         |
| 4 | Portfolio    | -                         |
| 5 | About        | -                         |
| 6 | Contact      | -                         |
| 7 | Blog         | -                         |
| 8 | Custom       | Free Custom 1             |
| 9 | Custom       | Free Custom 2             |
|10 | Custom       | Free Custom 3             |

**Checklist:** [ ] Use a coupon that covers the full Express/DIFM amount. [ ] **Home** remains selected. [ ] Select exactly these 10 pages. [ ] Complete checkout ($0); confirm content form link and that all 10 pages (including the three custom titles) appear. No credits used.

---

### Test 5 (add-on): Support session for Custom Blog/Shop rows

This test validates support-only rows that are not expected in regular customer sessions.

- **Session:** A8C team member + support session enabled.
- **Flow:** Run once in **non-store** (Custom Shop + Custom Blog available) and once in **store** (Custom Blog only; regular **Shop** is the store row).
- **Goal:** Validate visibility and toggling for:
  - `SUPPORT_SHOP_PAGE` (Custom Shop Page) — **non-store only**
  - `SUPPORT_BLOG_PAGE` (Custom Blog Page)

**Checklist:** [ ] Rows appear only when support session + Automattician detection are active. [ ] Click tiles to select/deselect (same grid rules as other optional types). [ ] Selected values persist and round-trip through dependencies/payloads. [ ] Non-support session hides both rows.

**If the tiles do not show or clicks do nothing:**

- Confirm **Redux** support session is active (support user boot should run after refresh; `sessionStorage` / support flow must restore the session).
- **Automattician:** reader **teams** must load — wait a moment after opening the page picker, or refresh once; tiles depend on `isA8cTeamMember`.
- **Custom Shop:** only appears in **non-store** DIFM flows; in **store** flow use the normal **Shop** row and only **Custom Blog Page** as the extra support row.
- If you are logged in as the customer (not SU), or teams never load, the support-only tiles stay hidden.

---

### Test 6 (quick add-on): Blog RC verification

Run one quick sanity check using the **Blog RC** Calypso tool after DIFM form submission.

- **Priority:** High confidence check, but lightweight.
- **Scope:** One completed DIFM flow is enough.
- **Goal:** Confirm that after the form is submitted, **Blog RC** can generate pages via the DIFM Tools section.

**Result:** [x] Verified — after form submission, Blog RC can generate pages via DIFM Tools.

---

### Test 7 (quick add-on): Mobile picker sanity check

Quick mobile validation only; do not block release on this.

- **Priority:** Nice-to-have, non-blocking.
- **Scope:** Use a mobile device or responsive emulation (small viewport) in one flow.
- **Goal:** Ensure adding/removing extra pages still works on mobile layout.

**Checklist:** [ ] On mobile viewport, open page picker and add/remove optional pages. [ ] Add at least one Custom page via **Add a Custom Page**. [ ] Confirm Home remains required (and Shop remains required in store flow). [ ] Continue to checkout and verify selected page count still matches.

---

## Summary

- **UI:** Thumbnail grid with toggles; **no stepper**; **Home** always on; **Shop** required and locked in store flow; multiple pages only via **Custom** repeats.
- **Page coverage:** Tests 1–4 cover the picker’s standard types (Careers and Case Studies are **not** in the grid) plus **3× Custom** per test. Test 5 covers support-only Custom Blog/Shop rows.
- **Extra validation:** Test 6 adds a quick Blog RC content-creation check; Test 7 adds a quick mobile picker sanity check (non-blocking).
- **Manual QA progress:** Tests **1–3** done; **Test 4** in progress.
