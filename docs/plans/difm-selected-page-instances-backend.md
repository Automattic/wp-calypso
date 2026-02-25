# DIFM selected_page_instances – Backend expectations and testing

## Summary

The frontend now sends and consumes an optional **`selected_page_instances`** array in addition to **`selected_page_titles`**. This enables distinct content per page instance (e.g. multiple Custom pages or multiple Services pages) and aligns with the [DIFM add-pages plan](./difm-add-pages-plan.md) (Option A).

- **Backward compatible:** `selected_page_titles` remains the source of truth when `selected_page_instances` is absent. The frontend synthesizes instances from titles when the API does not return instances.
- **Frontend-only until backend supports it:** Backend can ignore `selected_page_instances` in cart/checkout and in the website-content API until ready. No breaking change.

---

## 1. Data shape

### 1.1 `selected_page_instances` (optional)

Array of `{ id: string, type: string }`:

- **`id`** – Unique per selected page (e.g. `HOME_PAGE`, `SERVICES_PAGE`, `SERVICES_PAGE_2`, `CUSTOM_PAGE`, `CUSTOM_PAGE_2`). Same rules as in the [plan](./difm-add-pages-plan.md#31-selected-pages-frontend-state--submit).
- **`type`** – Page type (template). Matches existing `PageId` values used in `selected_page_titles`.

Order of the array is the **global selection order** (used for badges and for ordering pages in the website-content step).

### 1.2 Where it appears

| Context | Direction | Notes |
|--------|-----------|--------|
| **Cart extras** (DIFM product) | Frontend → backend | Optional. Sent when the picker step provides it (e.g. `selected_page_instances` in dependency store). Backend can ignore until implemented. |
| **Website-content API** (GET) | Backend → frontend | Optional. If the API returns `selected_page_instances`, the frontend uses it to build one form section per instance with correct id/title/content. If omitted, frontend synthesizes instances from `selected_page_titles`. |
| **Website-content API** (POST/save) | Frontend → backend | Pages in the request body are keyed by **instance id** (e.g. `SERVICES_PAGE_2`, `CUSTOM_PAGE_2`) when the flow used instances. Backend should persist and return pages by this id so that each instance keeps its own title/content. |

---

## 2. Backend expectations (when implementing)

1. **Accept** `selected_page_instances` in cart/checkout payloads and store or use it for pricing/fulfillment if needed. If not yet supported, ignore it; frontend still sends `selected_page_titles` and quantity.
2. **Return** `selected_page_instances` from the website-content GET endpoint when available (e.g. when the site was created with the new picker). Format: `[{ "id": "...", "type": "..." }, ...]` in the same order as the selected pages.
3. **Persist and return** website-content **pages** keyed by instance id when instances are used. Each `page.id` in the saved/returned payload should be the instance id (e.g. `CUSTOM_PAGE_2`) so the frontend can match and show distinct title/content per instance.

---

## 3. Testing strategy

### 3.1 Frontend (already covered by implementation)

- **Picker:** Select multiple instances of the same type (e.g. two Services, two Custom pages). Submit and confirm `selected_page_instances` is in the step payload and (when applicable) in cart extras. Badge numbers are global (1, 2, 3, …).
- **Website-content:** After submitting the picker with instances, open the website-content step. Each Custom (and multi-add) page should have its own section with distinct title/content. Saving and reloading should preserve per-instance data when the backend returns `selected_page_instances` and pages keyed by instance id.
- **Fallback:** Use an account/flow that only has `selected_page_titles` (no instances). Website-content should still initialize correctly (synthesized instances from titles).

### 3.2 Backend / E2E (for upstream)

- **Cart:** Add DIFM product with `selected_page_instances` in extras; confirm checkout and fulfillment still work (backend may ignore instances initially).
- **Website-content API:**  
  - GET: Return `selected_page_instances` and pages with `id` = instance id; confirm frontend shows correct number of sections and correct titles.  
  - POST: Send pages with mixed instance ids; confirm persistence and that GET returns them keyed by instance id.

---

## 4. References

- [DIFM add-pages plan](./difm-add-pages-plan.md) – Option A, data shape, page types.
- Frontend types: `SelectedPageInstance`, `WebsiteContentResponseDTO.selected_page_instances`, `WebsiteContentServerState.selectedPageInstances`.
- Frontend synthesis: `synthesizeInstancesFromTitles()` in `client/signup/difm/page-instances.ts` when API does not return instances.
