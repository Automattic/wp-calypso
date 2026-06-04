# Feature Clip close warning — design

**Issue:** RSM-3977 — _Closing the Feature Clip modal halts in-progress generation and discards the prompt — destructive with no warning_

## Problem

Closing the Image Studio modal (X, ESC, backdrop, or the Header close button) while a
feature clip is rendering silently aborts the in-flight generation. Because the modal
unmounts, `abortCurrentRequest()` fires on unmount (`components/index.tsx:85-95`) and the
clip is lost — nothing is added to the Media Library and the user gets no warning.

The single close handler, `useUnsavedChangesConfirmation` (`hooks/use-unsaved-changes-confirmation.ts`),
only opens a confirmation dialog when `hasUnsavedChanges || hasUpdatedMetadata`. During an
active clip generation the video URL has not landed yet, so `hasUnsavedChanges` is `false`
and the modal closes with no prompt.

## Scope

**This change is the warning only.** Per the issue's "at minimum" option, we warn the user
before a destructive close. We do **not**:

- preserve the prompt across close/reopen, or
- make generation a true background operation.

Both are larger follow-ups noted in the issue.

The warning fires **only for Feature Clip generation** — i.e. when
`isVideoMode && isAiProcessing` is true. `isVideoMode` is
`entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip`. Image generation/editing keeps
its current behavior (fast, a warning there would be friction).

## Signal

`isAiProcessing` (`getImageStudioAiProcessing()`) is synced from the agent's `isProcessing`
flag via `useImageStudioAgentSync`, so it is `true` across the whole clip lifecycle
(thinking → `generating-video` → `uploading`). Combined with `isVideoMode`, this is the
"clip generation in progress" signal. Both values are already selected in
`ImageStudioContent`.

## Behavior

When the user requests a close while a clip is generating, intercept it and show a
confirmation dialog instead of closing:

- **Cancel** → dismiss the dialog, modal stays open, generation continues.
- **Stop and close** → close the modal (existing unmount logic aborts the request),
  discarding the in-flight clip.

This covers every close path (X / ESC / backdrop / Header close), since they all funnel
through `handleRequestClose`.

## Implementation

### `hooks/use-unsaved-changes-confirmation.ts`

Extend the existing hook — it already owns `handleRequestClose`, ESC interception, and
`isExiting`, so centralizing avoids two hooks fighting over the close handler.

- New param: `isGenerationInProgress: boolean`.
- New state: `isGenerationWarningOpen`.
- New handlers:
  - `handleConfirmKeepGenerating` — closes the warning, does **not** exit.
  - `handleConfirmStopAndClose` — sets `isExiting`, calls `onExit( hasChanges )` (same exit
    path as the no-changes branch; unmount aborts the request), clears `isExiting`.
- `handleRequestClose` gains a **first-priority branch**: if `isGenerationInProgress`, open
  the generation warning. This takes precedence over the unsaved-changes dialog — no
  double-prompt; "Stop and close" exits directly.
- The ESC interceptor guard broadens from `hasUnsavedChanges` to
  `hasUnsavedChanges || isGenerationInProgress`.
- Update the hook's doc comment to describe the broader "close confirmation flow" (keep the
  name to avoid churn; it is used only in `components/index.tsx`).

### `components/index.tsx`

- Pass `isGenerationInProgress: isVideoMode && isAiProcessing` into the hook.
- Destructure the new return values.
- Render a second `ConfirmationDialog` instance gated on `isGenerationWarningOpen`.

### Dialog wording (matches the existing destructive "Delete this item" dialog convention)

- **Title:** `Generation in progress`
- **Body:** `Your clip is still generating. Closing now will stop it and discard your progress.`
- **Actions:**
  1. `{ text: 'Cancel', variant: 'secondary', onClick: handleConfirmKeepGenerating }` — first, auto-focused, safe default.
  2. `{ text: 'Stop and close', variant: 'primary', isDestructive: true, onClick: handleConfirmStopAndClose }`
- **`onClose`** → `handleConfirmKeepGenerating`

All strings via `__( …, __i18n_text_domain__ )`. Preserve the curly apostrophe in "you'll".

### `utils/tracking.ts`

Add three thin events via `recordImageStudioEvent` (naming follows `trackImageStudioFeatureClip*`):

- `trackImageStudioFeatureClipCloseWarningShown()` — warning opened.
- `trackImageStudioFeatureClipCloseWarningKeptGenerating()` — user chose Cancel.
- `trackImageStudioFeatureClipCloseWarningStopped()` — user chose Stop and close.

Wire them in the hook (shown when the warning opens; the other two in the respective handlers).

## Testing

TDD against the existing `hooks/use-unsaved-changes-confirmation.test.js` (extend in place —
not adding a new `.test.js`, which the package forbids). New cases:

1. `isGenerationInProgress` true → `handleRequestClose` opens the generation warning (not the
   unsaved-changes dialog) and does **not** call `onExit`.
2. Generation warning takes precedence when both `isGenerationInProgress` and
   `hasUnsavedChanges` are true.
3. `handleConfirmKeepGenerating` closes the warning and does **not** call `onExit`.
4. `handleConfirmStopAndClose` calls `onExit` and toggles `isExiting`.
5. `isGenerationInProgress` false → existing behavior unchanged (regression guard).

Full validation: `yarn build && yarn test && yarn lint && yarn typecheck` in the package.

## Edge cases

- **Both generation in progress and unsaved changes:** generation warning wins; "Stop and
  close" exits directly without a second save prompt. Closing already discarded work in this
  case before this change, so this is no worse and avoids a confusing two-step dialog.
- **Non-video modes:** `isGenerationInProgress` is always `false`, so behavior is unchanged.
