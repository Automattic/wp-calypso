# Feature Clip Telemetry — Design

**Date:** 2026-05-18
**Package:** `packages/image-studio`
**Status:** Approved

## Problem

The Feature Clip (video) flow in Image Studio has four telemetry gaps that
block answering basic success-metric questions:

1. **No surface discriminator on share events.** `trackImageStudioReelShareClicked`
   / `trackImageStudioGenericShareClicked` payloads carry no placement. We cannot
   answer "what % of clip shares originate from the sidebar vs the modal".
2. **"Add to post" is untracked.** The most important sidebar conversion action
   (clip → embedded in the post) emits no event.
3. **Regenerate vs first-Generate are merged.** Both emit `image_studio_opened`
   with the same `PostEditorFeatureClip` placement, so "user generated their
   first clip" is indistinguishable from "user wasn't happy and regenerated".
4. **No panel-view event.** There is no denominator for sidebar engagement rates.

## Goals

- Make share-event origin (sidebar vs modal) measurable across the full funnel.
- Track the "Add to post" conversion action.
- Distinguish first-Generate from Regenerate.
- Provide an impression event as the denominator for sidebar engagement.

## Non-goals

- Tracking panel expand/collapse state.
- Per-clip-state (empty vs preview) engagement breakdowns.
- Any change to runtime/modal behavior.

## Design

### 1. Surface discriminator on share events

- Add an exported type to `src/utils/tracking.ts`:
  `export type ShareSurface = 'sidebar' | 'modal';`
- Add a **required** `surface: ShareSurface` option to `useReelShare` and
  `useGenericShare`. Required so no call site can silently omit it.
  - `FeatureClipPreview` (sidebar, `feature-clip-sidebar-extension.tsx`) →
    `surface: 'sidebar'`.
  - `share-reel-action` (modal,
    `components/generate-layout/share-reel-action/index.tsx`) →
    `surface: 'modal'`.
- Thread `surface` into **all** reel + generic share tracking functions so the
  `surface` property appears on every resulting event:
  - Reel: `reel_share_clicked`, `reel_share_not_connected`,
    `reel_share_connection_disabled`, `reel_share_post_not_published`,
    `reel_share_invalid_state`, `reel_share_cancelled`,
    `reel_share_dispatched`, `reel_share_failed`.
  - Generic: `generic_share_clicked`, `generic_share_completed`,
    `generic_share_failed`.
- Rationale for an explicit param (rather than the store's auto-added
  `placement`): sidebar shares can fire without the modal ever opening, so the
  Image Studio store entry point is `null` or stale for those events.

### 2. "Add to post" event

- New tracking function in `tracking.ts`:
  `trackImageStudioFeatureClipAddedToPost( { attachmentId }: { attachmentId: number } )`.
- Emits `image_studio_feature_clip_added_to_post` with props:
  `attachment_id`, `surface: 'sidebar'`.
- Called inside `handleAddToPost` in `feature-clip-sidebar-extension.tsx`,
  after the `core/video` block is inserted.

### 3. Generate vs Regenerate via `mode`

- `openImageStudioForFeatureClip()` gains a parameter indicating whether a clip
  already exists for the post.
- Empty-state "Generate clip" button → calls with `mode: ImageStudioMode.Generate`.
- Preview "Regenerate" button → calls with `mode: ImageStudioMode.Edit`.
- That `mode` is passed only into `trackImageStudioOpened`. No behavior change:
  `openImageStudio()` is already invoked without a mode, so the modal's actual
  mode is unaffected and continues to derive from the entry point.
- Analysts split the two by reading `mode` on `image_studio_opened` events with
  the `post_editor_feature_clip` placement.

### 4. Panel-view event

- New tracking function in `tracking.ts`:
  `trackImageStudioFeatureClipPanelViewed()`.
- Emits `image_studio_feature_clip_panel_viewed` with no extra properties
  beyond the auto-added base props (session id, screen, etc.).
- Fired once on `FeatureClipPanel` mount via `useEffect( …, [] )`. A plain
  impression — fires before the clip attachment resolves, so it carries no
  clip-state timing dependency.

## Events summary

| Event | Trigger | New / Changed | Key props |
| --- | --- | --- | --- |
| `image_studio_reel_share_*` (8) | Reel share funnel | Changed | `+ surface` |
| `image_studio_generic_share_*` (3) | Generic share funnel | Changed | `+ surface` |
| `image_studio_opened` (clip placement) | Generate / Regenerate | Changed | `mode` now generate vs edit |
| `image_studio_feature_clip_added_to_post` | "Add to post" clicked | New | `attachment_id`, `surface` |
| `image_studio_feature_clip_panel_viewed` | Panel mounts | New | (base props only) |

## Testing

- `src/utils/tracking.test.ts` — cover the two new functions and the `surface`
  param on all changed share functions.
- `src/hooks/use-reel-share/index.test.ts` and
  `src/hooks/use-generic-share/index.test.ts` — assert `surface` is threaded
  into the tracking calls.
- `src/extensions/feature-clip-sidebar-extension.test.tsx` — cover the
  add-to-post event, the panel-view event on mount, and the regenerate `mode`.

## Delivery

All four gaps ship in a single PR.
