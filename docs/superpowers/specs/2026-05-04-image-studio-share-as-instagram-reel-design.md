# Image Studio: Share as Instagram Reel

Linear: [RSM-2117](https://linear.app/a8c/issue/RSM-2117)

## Summary

After Image Studio's video-generation flow produces a clip, surface a "Share as Instagram Reel" CTA in the video preview. Clicking it routes the just-generated MP4 into Jetpack Social's existing Reels publishing path — only to Instagram, and only when the current post is already published.

This is a UI-plumbing change inside `packages/image-studio`. No new wpcom REST endpoints, no new server-side code. The wpcom prerequisite the Linear issue originally proposed (`wpcom_set_post_video_for_publicize` helper + `POST /wpcom/v2/sites/{site}/publicize/instagram-reel`) is not needed — the same mechanism is available via post-meta + the existing `share-post` thunk.

## Why this is frontend-only

The end-to-end Reels submission path is already shipped on wpcom. The chain we lean on:

1. JS writes `meta.jetpack_social_options` with `attached_media` and `media_source: 'upload-video'` via `editorStore.editPost`. The post-meta key is already registered server-side.
2. JS dispatches `shareCurrentPost` from the `jetpack-social-plugin` store. That hits the existing `POST /wpcom/v2/publicize/share-post/{postId}` endpoint (`apiPath` read from `getSocialScriptData().api_paths.resharePost`).
3. Server-side, `Extractor::get_attached_media()` (`wpcom/wp-content/lib/publicize/extractor.php:1075-1101`) already handles `media_source: 'upload-video'`: it pulls the attachment URL by ID and feeds it to `get_validated_media_urls()`. `Instagram_Business_Connection::submission()` (`wpcom/wp-content/lib/publicize/connections/instagram-business.php:205`) then runs that URL through the existing `media_type=REELS` container path.

## In scope

- A new `<ShareReelAction />` component rendered inside `GenerateLayout` when a generated video is available and the entry point is `PostEditorFeatureClip`.
- A new `useReelShare` hook encapsulating the click handler and pre-checks. Component stays a thin renderer (per the package's "prefer hooks over components" convention).
- Pre-check pipeline: connection, publication state, defensive state guards.
- Click handler: write meta → dispatch `shareCurrentPost` with non-IG connections skipped → snackbar on success.
- Telemetry via `recordImageStudioEvent()`.
- Notices via the existing `ImageStudioNotice` component (driven by the Image Studio store's `addNotice` action).

## Out of scope (explicit)

Same as the Linear issue, plus:

- Standalone Media Library "Share as Reel" action — gated by entry point.
- Auto-publishing a draft to enable sharing — instead, we throw a friendly "Publish first" notice.
- Stories, carousels, scheduling, music overlay, cover-frame selection.
- Multi-platform fan-out (FB Reels, TikTok, YouTube Shorts, Threads). The skip-list explicitly excludes Threads from this CTA even though the wpcom Threads connection accepts video.
- Edit/delete published Reels, Insights polling.
- The wpcom helper + REST endpoint described in the original Linear issue.

## User flow

### Happy path

1. User is editing an already-published post.
2. Opens the "Generate Feature Clip" sidebar panel, generates a video clip.
3. Studio canvas shows the generated MP4 in a 9:16 frame. Below it: a `<Button variant="primary">` labeled "Share as Instagram Reel" with an Instagram icon.
4. User clicks. Button enters in-flight state (disabled, loading spinner).
5. We:
   a. Dispatch `editorStore.editPost({ meta: { jetpack_social_options: { ...current, attached_media: [{ id, url, type: 'video/mp4' }], media_source: 'upload-video' } } })`.
   b. Compute `skipped_connections` = all enabled connections where `service_name !== 'instagram-business'`.
   c. Dispatch `jetpack-social-plugin/shareCurrentPost({ message: '', skipped_connections }, { savePost: true, apiPath })`. The `savePost: true` flushes the meta we just wrote.
6. Server processes the share. Polling inside `Instagram_Business_Connection::submission()` may take 10s–several minutes depending on clip size.
7. On success: snackbar "Shared to Instagram as a Reel". Button returns to enabled state.
8. On failure: `shareCurrentPost` already creates an error notice via `@wordpress/notices`; we don't add a second one.

### Error states (in order — first failure wins)

1. **No active `instagram-business` connection.** Show `ImageStudioNotice` (warning, dismissible) with a single action button: "Connect Instagram", linking to `/marketing/connections/{site}` in a new tab. Track `image_studio_reel_share_not_connected`.
2. **Post is not published** (`isCurrentPostPublished()` returns false). Show `ImageStudioNotice` (warning, dismissible): "Publish this post first to share it as an Instagram Reel." No action button. Track `image_studio_reel_share_post_not_published`.
3. **Defensive — missing video state** (`currentAttachmentId` or `currentVideoUrl` is null when click fires). Show `ImageStudioNotice` (error). Track `image_studio_reel_share_invalid_state`. Should not happen in practice — the button is hidden when video state is empty.

## Architecture

### Files

```
packages/image-studio/src/
├── components/
│   └── generate-layout/
│       ├── index.tsx                         (modified — render <ShareReelAction />)
│       └── share-reel-action/
│           ├── index.tsx                     (new — thin renderer)
│           ├── index.test.tsx                (new)
│           └── style.scss                    (new)
├── hooks/
│   └── use-reel-share/
│       ├── index.ts                          (new — selectors, pre-checks, click handler, telemetry)
│       └── index.test.ts                     (new)
└── utils/
    └── tracking.ts                           (modified — add reel-share event helpers)
```

### Cross-bundle data access

Image Studio runs in its own bundle. We do not import from `jetpack-publicize` or any Calypso state code. Access is via `@wordpress/data` against three stores that are guaranteed to be present in the post-editor context:

| Store                   | Reads                                                                          | Writes                     |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| `video-studio` (own)    | `getCurrentVideoUrl`, `getCurrentAttachmentId`                                 | —                          |
| `core/editor`           | `getCurrentPostId`, `isCurrentPostPublished`, `getEditedPostAttribute('meta')` | `editPost`                 |
| `jetpack-social-plugin` | `getConnections`, `getConnectionsByService`, `isSharingCurrentPost`            | `shareCurrentPost` (thunk) |

The `share-post` API path is read directly from the global Jetpack script-data: `window.JetpackScriptData?.social?.api_paths?.resharePost`. We don't add a runtime dependency on `@automattic/jetpack-script-data` or `@automattic/jetpack-publicize-components` — image-studio is a separate bundle and intentionally avoids cross-package imports for cross-bundle state. If the global isn't present, the share button is hidden (defensive — we're not in a Jetpack-Social-enabled context). A single typed helper, e.g. `getResharePath()`, encapsulates the read so the global access is in one place with a clear comment.

### `useReelShare` contract

```ts
type ReelShareState = {
    canShare: boolean;          // all preconditions met (connection + published)
    reason: 'no-connection' | 'post-not-published' | 'no-video' | null;
    isSharing: boolean;         // mirrors selectors.isSharingCurrentPost
};

type ReelShareApi = ReelShareState & {
    handleShare: () => Promise< void >;
};

function useReelShare(): ReelShareApi;
```

`handleShare` performs:

1. Tracks `image_studio_reel_share_clicked`.
2. Re-evaluates pre-checks (state may have changed since render). Routes to the appropriate `addNotice` + tracking event.
3. On happy path: dispatches `editPost`, computes `skipped_connections`, dispatches `shareCurrentPost`, awaits the promise, dispatches success/failure notice + tracking event.

### Visibility and enabled state of the CTA

The button **renders** only when all of these are true (hard hide, no UI shown otherwise):

- `entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip`
- `currentVideoUrl` is non-empty
- The `jetpack-social-plugin` store is registered and `window.JetpackScriptData?.social?.api_paths?.resharePost` is defined (defensive — guards against non-Social hosts)

When rendered, the button is **always enabled** unless an in-flight share is running (`isSharingCurrentPost === true`, in which case it's disabled with a spinner). All other gating is handled at click-time via the pre-check pipeline, which surfaces the appropriate `ImageStudioNotice` and fires the matching telemetry event.

Rationale for not pre-disabling on connection / publication state:

- Click-time checks read fresh state from `core/editor` and `jetpack-social-plugin`. State can change after render (e.g. user publishes the post in a sibling Gutenberg pane while Studio is open).
- The notice-on-click pattern matches the rest of Image Studio (`ImageStudioNotice` is the package's standard surface for transient warnings).
- Telemetry is cleaner — every click produces one event, gated by the reason that fired.

The button shows a tooltip on hover/focus only for the in-flight disabled state ("Sharing to Instagram…"). No tooltip for the enabled state — the label "Share as Instagram Reel" is self-explanatory, and any gate-related context appears via notice after click.

## Telemetry

All events go through `recordImageStudioEvent()` (auto-prefixes `jetpack_big_sky_` / `wpcom_big_sky_`):

| Event                                        | Fires when                                 | Properties                                  |
| -------------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `image_studio_reel_share_clicked`            | Button click, before any check             | `mode`, `attachment_id`, `duration_seconds` |
| `image_studio_reel_share_not_connected`      | Pre-check 1 fails                          | (base)                                      |
| `image_studio_reel_share_post_not_published` | Pre-check 2 fails                          | (base)                                      |
| `image_studio_reel_share_invalid_state`      | Pre-check 3 fails                          | (base)                                      |
| `image_studio_reel_share_dispatched`         | `shareCurrentPost` resolved truthy         | (base)                                      |
| `image_studio_reel_share_failed`             | `shareCurrentPost` resolved falsy or threw | `error_message` if available                |

`(base)` = standard set added by the wrapper (session id, entry point, platform prefix).

## Open questions / known limitations

1. **Private blogs / Atomic-private sites.** Meta's crawler must `GET` the video URL. WPCOM CDN URLs are public for public blogs but private blogs return 401. Behavior in v1: the existing IG submission will surface Meta's error via `shareCurrentPost`'s failure path. Treat as a known limitation; add a public-blog gate or signed-URL proxy in a follow-up if user reports come in.
2. **Business / Creator account requirement.** Meta's Reels API requires a Business or Creator IG account. This is implicitly enforced — if no `instagram-business` Keyring connection exists, the CTA shows the "Connect Instagram" notice. Personal accounts cannot establish that connection in the first place.
3. **Meta quota (50 posts / 24h).** Out of scope. Surface Meta's error if hit.
4. **End-to-end verification.** All paths above are read from existing code, not run end-to-end with a real Veo MP4 + real IG Business connection. Manual sandbox test required before declaring v1 shippable. Specifically: confirm the Veo-generated MP4's MIME, dimensions, and duration pass `Instagram_Business_Connection`'s validation, and that Meta's crawler can fetch the WPCOM CDN URL without auth.
5. **Persistent meta after share.** The `attached_media` + `media_source: 'upload-video'` post meta persists after the share. Future republishes/re-shares of this post via the Jetpack Social sidebar will continue to use this video as the attached media for compatible services. Acceptable behavior — the user explicitly attached it. They can clear it from the Jetpack Social sidebar if undesired.
6. **Linear issue update.** The Linear issue's "Hard prerequisite" section needs to be removed (or marked obsolete) since no wpcom changes are required. The "References" line pointing at `video-generation-handler-extension.ts` should be corrected to `abilities/update-canvas-video.ts` + `stores/video-studio/index.ts`.

## Follow-ups (separate issues)

These are not blocked by this work but are worth filing alongside:

1. **Bump IG Graph API version** in `instagram-business.php:29` from `v17.0` to `v21.0+`. Meta deprecated v17 in Jan 2026 — ongoing shares may silently fail. Independent of this feature; affects all IG Reel publishing.
2. **`share_to_feed` toggle** on the IG submission so a Reel can also appear in the IG feed. Requested separately by the Reels rollout.
3. **Telemetry on the wpcom side** — server-side counters for IG Reel submissions (success/failure rates by reason). Not strictly needed if Tracks events from the client are sufficient.

## Risks

- **Cross-bundle store availability.** If `jetpack-social-plugin` or `core/editor` aren't registered when Studio renders inside Feature Clip, the button hides itself. Validate that the Feature Clip entry point always has both stores ready. (Reasonable — the entry point is `PluginDocumentSettingPanel`, which only registers in the Gutenberg post editor.)
- **`getSocialScriptData()` shape drift.** The `api_paths.resharePost` field is read from script data injected by Jetpack. If Jetpack changes that key, our share call fails with a generic error. Mitigation: snapshot the path in a constant near the click handler with a clear comment, and add a runtime fallback that hides the button if the path is missing.
- **`isSharingCurrentPost` selector during in-flight share.** While a share is in progress (10s–several minutes), the button must be disabled. Selector exists in `jetpack-social-plugin` per the codebase. Validate it's exposed as a selector and not just internal state.

## Effort

~2 dev days for the Calypso UI + hook + tests. Manual sandbox verification +0.5 day. No wpcom work.
