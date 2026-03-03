---
name: image-studio-ui-tests
description: Run comprehensive UI tests for the Image Studio feature
---

# Image Studio UI Tests

Run comprehensive UI tests for the Image Studio feature. All tests are required to pass.

### Testing Strategy

**Only generate one image per test run** (Section 6). All other sections verify DOM state without triggering AI generation. This keeps the test run under 5 minutes instead of 20+.

- **Smoke test** (Section 6): One real generation to verify the end-to-end AI pipeline works
- **All other sections**: Verify UI elements, controls, navigation, dialogs, and entry points via DOM assertions only — no generation needed

---

## Prerequisites

- Important: If test site is not provided, ask the user for test site URL (e.g., `https://yoursite.wordpress.com`)
- If not logged in, stop and ask user to log in before proceeding
- At least 1 image uploaded to Media Library
- (Optional) A draft post with an Image block for Sections 9-10

---

## Section Dependencies

Sections are designed to run sequentially, but some depend on others:

```
Section 1 (Entry Points)
  ├── 1.3 "Edit with AI" row action ──► Sections 2, 3, 4 (Edit Mode)
  └── 1.1 "Generate Image" button ──► Sections 5, 6, 7 (Generate Mode)

Section 8 (Hash Deep-Link) ──► Fallback entry to Edit Mode (Sections 2-4)

Section 9 (Block Editor Generate) ──► independent
Section 10 (Block Editor Edit) ──► requires existing image in a post

Section 11 (Navigation Arrows) ──► requires Edit Mode (2+ images in library)
Section 12 (Delete Permanently) ──► requires Edit Mode with Image Info sidebar
```

---

## Setup

1. Navigate to test site and log in if needed
2. Go to `wp-admin/upload.php` (Media Library)
3. Note the ID of an existing image (hover over "Edit" and check URL for `post=123`)

---

## CSS Selectors & Aria Labels Reference

Use these selectors for automated testing with Playwright.

### Media Library Page

| Element                | Selector                                                                       |
| ---------------------- | ------------------------------------------------------------------------------ |
| Generate Image button  | `.big-sky-image-studio-link` or `.page-title-action.big-sky-image-studio-link` |
| List view toggle       | `.view-switch-list` or `button[id="view-switch-list"]`                         |
| Row actions (on hover) | `.wp-list-table tbody tr td.title .row-actions`                                |
| Image title link       | `.wp-list-table tbody tr td.title a`                                           |

### Image Studio Modal (shared across modes)

| Element                     | Selector / Aria Label                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Modal overlay               | `.components-modal__screen-overlay.image-studio-overlay`                                            |
| Modal content               | `.image-studio-modal__content`                                                                      |
| Header bar                  | `.image-studio-header`                                                                              |
| Title text ("Image Editor") | `.image-studio-header__title`                                                                       |
| Beta badge                  | `.image-studio-badge`                                                                               |
| Nav prev button             | `aria-label="Previous image ⌘←"` / `.image-studio-header__nav-button`                               |
| Nav next button             | `aria-label="Next image ⌘→"` / `.image-studio-header__nav-button`                                   |
| Filename display            | `.image-studio-header__filename`                                                                    |
| Media Library button        | `aria-label="Edit this image in the WordPress Media Library"` / `.image-studio-classic-editor-link` |
| Select tool                 | `aria-label="Select an area of the image to edit"`                                                  |
| Image Info toggle           | `aria-label="View or edit information about the image"` / `.image-studio-toolbar-alt-button`        |
| Save button                 | `.image-studio-header button.is-primary` (text: "Save" or "Save & Apply")                           |
| Close button                | `aria-label="Close image editor"`                                                                   |
| Notices container           | `.image-studio-modal__notices`                                                                      |
| Screen reader status        | `.image-studio-sr-only`                                                                             |

### Sidebar (Image Info)

| Element               | Selector                         |
| --------------------- | -------------------------------- |
| Sidebar container     | `.image-studio-sidebar`          |
| Sidebar header        | `.image-studio-sidebar__header`  |
| Sidebar content       | `.image-studio-sidebar__content` |
| Modal sidebar wrapper | `.image-studio-modal__sidebar`   |

### Generate Mode (Chat / AI Agent)

| Element                    | Selector / Aria Label                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| AI agent container         | `.image-studio-agent.agenttic`                                                    |
| Chat input (textarea)      | `textarea` inside `.image-studio-modal__content`                                  |
| Input toolbar              | `.image-studio-modal__input-toolbar`                                              |
| Send button                | `aria-label="Send message"`                                                       |
| Good response (thumbs up)  | `aria-label="Good response"`                                                      |
| Bad response (thumbs down) | `aria-label="Bad response"`                                                       |
| Style selector button      | `.AgentUIInputToolbar-module_button` (text shows current style, e.g. "None")      |
| Aspect Ratio button        | `.AgentUIInputToolbar-module_button` (text shows "Aspect Ratio" or current ratio) |
| Loading state              | `.image-studio-suggestions-loading` or `.image-studio-agent-loading`              |

### Confirmation Dialog (Unsaved Changes)

| Element        | Selector                                    |
| -------------- | ------------------------------------------- |
| Dialog content | `.image-studio-confirmation-dialog-content` |

### Canvas

| Element       | Selector                     |
| ------------- | ---------------------------- |
| Image display | `.image-studio-image`        |
| Exit overlay  | `.image-studio-exit-overlay` |

### Block Editor

| Element                   | Selector                                                   |
| ------------------------- | ---------------------------------------------------------- |
| Editor content iframe     | `iframe[name="editor-canvas"]`                             |
| Block Inserter button     | `aria-label="Block Inserter"`                              |
| Image block placeholder   | `[data-type="core/image"]` (inside editor iframe)          |
| Generate Image (in block) | `button:has-text("Generate Image")` (inside editor iframe) |

---

## Automation Notes (Playwright)

When running these tests with Playwright MCP (not playwright-test):

- **Verification via DOM, not screenshots**: Do NOT take screenshots to verify results. Instead, use `playwright_evaluate` to query the DOM for expected elements (e.g., check that `.image-studio-overlay` exists and has `offsetHeight > 0`). This is faster and more reliable. Use `playwright_get_visible_text` or `playwright_get_visible_html` for content checks.
- **Block editor iframe**: The editor content area is inside `iframe[name="editor-canvas"]`. Use `playwright_iframe_click` / `playwright_iframe_fill` for interactions inside the editor canvas.
- **Image Studio modal**: The modal uses `.image-studio-overlay` / `.image-studio-modal__content` and intercepts pointer events on background elements. Target elements inside the modal specifically.
- **Suggestion chips**: Clicking a suggestion chip populates the textarea with an expanded prompt but does **not** auto-send. You must press Enter or click the send button after.
- **Generation timing**: Instead of fixed `sleep` calls, poll for `.image-studio-image` to appear or for the loading indicator to disappear. Max wait: 50 seconds.
- **Generation retry rule**: If no image appears by timeout (even without an explicit error), retry once with the same prompt. If retry also fails, mark as backend issue and continue.
- **Style/Aspect Ratio buttons**: These use dynamic module class names (`AgentUIInputToolbar-module_button`). Prefer matching by text content or aria-label.
- **Block Editor setup order (important)**:
  1. Click **Add block** inside `iframe[name="editor-canvas"]` (inline inserter), choose **Image**.
  2. Verify the Image placeholder appears in the iframe.
  3. For Section 9, assert/click **Generate Image** from that placeholder.
  4. For Section 10, click **Select Image** in that same placeholder, then choose an item in media modal and click **Select** before checking toolbar.
  5. Only assert **Edit with AI** after the image is actually inserted and the block is selected.
- **Toolbar visibility in block editor**: After inserting/selecting an image, click the image once and wait for block toolbar to render before asserting `Edit with AI`.
- **Asserting element state**: Use `playwright_evaluate` to check:
  - Visibility: `element.offsetHeight > 0`
  - Disabled: `element.disabled === true` or `element.getAttribute('aria-disabled') === 'true'`
  - Text content: `element.textContent.includes('expected text')`
  - Existence: `document.querySelector('.selector') !== null`

---

## Section 1: Media Library Entry Points

**Setup:** Must be on Media Library page (`wp-admin/upload.php`)

| Step | Action                                                    | Expected Result                                                                                                                  |
| ---- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Look at toolbar above media grid                          | **"Generate Image"** button visible (`.big-sky-image-studio-link`)                                                               |
| 1.2  | Click **"List view"** toggle (icon with horizontal lines) | View switches to list/table format                                                                                               |
| 1.3  | Hover mouse over any image row                            | Row actions appear: **"Edit"**, **"Delete Permanently"**, **"View"**, **"Copy URL"**, **"Download file"** AND **"Edit with AI"** |
| 1.4  | Look at left sidebar navigation                           | **"AI Editor"** menu item exists below "Media" (note: this links to the site editor, not Image Studio edit mode)                 |

**FAIL if:** Any expected element is missing

**Note:** If 1.3 fails, use Section 8 (hash deep-link) as fallback to reach Edit Mode.

---

## Section 2: Edit Mode

**Setup:** Must have image ID from Media Library. Enter via "Edit with AI" row action (Section 1.3) or hash deep-link (Section 8).

| Step | Action                                        | Expected Result                                                                                                                                                               |
| ---- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | Click **"Edit with AI"** on any image row     | Modal opens (`.image-studio-overlay`), header shows **"Image Editor"** (`.image-studio-header__title`) with **"Beta"** badge (`.image-studio-badge`)                          |
| 2.2  | Examine modal header (`.image-studio-header`) | Left: nav arrows, **"Media Library"** button; Center: **"Select"** tool; Right: **"Image Info"** toggle, **"Save"** button, **Close (X)** (`aria-label="Close image editor"`) |
| 2.3  | Look at main canvas area                      | Selected image displayed (`.image-studio-image`) full-size with no crop/highlight overlays                                                                                    |
| 2.4  | Click **"Image Info"** toggle in header       | Sidebar (`.image-studio-sidebar`) slides in from right showing metadata fields                                                                                                |

**FAIL if:** Modal doesn't open, header elements missing, or canvas blank

---

## Section 3: Sidebar & Metadata

**Setup:** Must have Edit Mode open with Image Info sidebar (`.image-studio-sidebar`) visible

| Step | Action                                                     | Expected Result                                                                         |
| ---- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 3.1  | Examine sidebar content (`.image-studio-sidebar__content`) | Fields: **Title**, **Caption**, **Description**, **Alt Text**, **File Details** section |
| 3.2  | Look for **Regenerate** buttons                            | Each field has a sparkles/refresh icon button to its right                              |
| 3.3  | Click **Regenerate** next to **Alt Text** field            | Field shows loading state, then new AI-generated text appears                           |
| 3.4  | Click **Image Info** toggle to close sidebar               | Sidebar slides out, canvas expands                                                      |
| 3.5  | Click **Image Info** toggle again                          | Sidebar reopens, edited Alt Text still shows new value                                  |

**FAIL if:** Regenerate buttons missing, AI fails to generate, or edits don't persist

---

## Section 4: Unsaved Changes Dialog

**Setup:** Must have Edit Mode open

| Step | Action                                                                                                                 | Expected Result                                                                            |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 4.1  | Capture current attachment ID from URL hash or row action (`data-attachment-id`)                                       | Stable ID is available for deterministic reopen                                            |
| 4.2  | Edit the **Title** field (append " - TEST")                                                                            | Title field shows modified text                                                            |
| 4.3  | DO NOT click Save                                                                                                      | —                                                                                          |
| 4.4  | Click **Close (X)** (`aria-label="Close image editor"`)                                                                | Confirmation dialog appears (`.image-studio-confirmation-dialog-content`)                  |
| 4.5  | Examine dialog content                                                                                                 | Text: "You have unsaved changes"; Buttons: **"Discard"** (secondary), **"Save"** (primary) |
| 4.6  | Click **"Discard"**                                                                                                    | Dialog closes, modal closes, changes lost                                                  |
| 4.7  | Wait for modal teardown (overlay removed)                                                                              | `.image-studio-overlay` no longer exists                                                   |
| 4.8  | Reopen the **same attachment ID** (prefer direct hash: `upload.php#ai-image-editor={ID}` or exact row action selector) | Edit mode opens for that exact image                                                       |
| 4.9  | Verify Title                                                                                                           | Title shows original value (without " - TEST")                                             |

**FAIL if:** No confirmation dialog appears, or changes persist after discard

---

## Section 5: Generate Mode

**Setup:** Must be on Media Library page

| Step | Action                                                           | Expected Result                                                                                                                                                  |
| ---- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1  | Click **"Generate Image"** button (`.big-sky-image-studio-link`) | Modal opens showing "Let's create!" view                                                                                                                         |
| 5.2  | Examine initial view                                             | Large canvas area with gradient/placeholder; chat-style input (`textarea`) at bottom with placeholder "Describe your image..."                                   |
| 5.3  | Look for **Style** selector                                      | Button with pencil icon showing current style name (defaults to **"None"**)                                                                                      |
| 5.4  | Click **Style** button                                           | Panel opens showing style options: **"None"**, **"Vivid"**, **"Anime"**, **"Photographic"**, **"Digital Art"**, **"Comicbook"**, etc. Each has preview thumbnail |
| 5.5  | Select **"Photographic"** style                                  | Style panel closes, **"Photographic"** shown as selected                                                                                                         |
| 5.6  | Look for **Aspect Ratio** selector                               | Button showing **"Aspect Ratio"** (when default) or current ratio label                                                                                          |
| 5.7  | Click **Aspect Ratio** button                                    | Panel opens showing ratios: **"1:1"** (square), **"16:9"**, **"9:16"**, **"4:3"**, **"3:4"**. Each has a visual icon showing the shape                           |
| 5.8  | Select **"16:9"** ratio                                          | Panel closes, **"16:9"** shown as selected in button                                                                                                             |

**FAIL if:** Style/aspect panels don't open, options missing, or selections don't update

---

## Section 6: Prompt & AI Response (SMOKE TEST — only section that generates)

**Setup:** Must be in Generate Mode. **This is the only section that triggers AI generation.** All other sections verify DOM only.

| Step | Action                                                        | Expected Result                                                                                                          |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 6.1  | Look for prompt suggestions                                   | Above input: suggestion chips like **"Cozy cafe scene"**, **"Mountain landscape"**, **"Professional workspace"**         |
| 6.2  | Type in chat input: "sunset over ocean with palm trees"       | Text appears in input field (`textarea` inside `.image-studio-modal__content`)                                           |
| 6.3  | Press Enter or click send arrow (`aria-label="Send message"`) | Input clears, prompt appears as chat bubble, loading indicator ("Thinking..." / "Bringing your idea to life...") appears |
| 6.4  | Wait for generation (up to 50 seconds)                        | Loading disappears, generated image appears in canvas. Header updates to show "Image Editor" with filename.              |
| 6.5  | Look for AI response message                                  | Chat shows descriptive text about the generated image                                                                    |
| 6.6  | Look for feedback buttons                                     | Below generated image: thumbs up/down icon buttons (`aria-label="Good response"` / `aria-label="Bad response"`)          |
| 6.7  | Click **"Good response"** (thumbs up)                         | Button becomes highlighted/filled                                                                                        |

**FAIL if:** Generation fails (check for streaming error notices), no image appears, feedback buttons missing

**Note:** If generation fails with "Streaming error" **or** times out with no image, retry once. If it fails again, note as a backend issue, **mark Sections 6 and 7 for manual testing**, and continue to Section 8. Section 7 (Save Flow) depends on a generated image and cannot be tested without one.

---

## Section 7: Save Flow

**Setup:** Must have generated image in canvas

| Step | Action                                                        | Expected Result                                                         |
| ---- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 7.1  | Click **"Save"** button in header                             | Button shows loading state ("Saving..."), then returns to normal        |
| 7.2  | Look for success notice (`.image-studio-modal__notices`)      | Check for notice text (may be brief or absent)                          |
| 7.3  | Verify modal state                                            | Modal **remains open** (does NOT auto-close)                            |
| 7.4  | Click **Close (X)** (`aria-label="Close image editor"`)       | Modal closes                                                            |
| 7.5  | Verify in Media Library                                       | New generated image appears at top of list (check item count increased) |
| 7.6  | Click **"Edit with AI"** on the newly generated top-row image | Edit Mode opens with generated image loaded                             |
| 7.7  | Click **"Image Info"** toggle                                 | Sidebar opens with metadata fields rendered                             |
| 7.8  | Validate metadata fields                                      | **Title**, **Alt Text**, and **File Details** are present and non-empty |
| 7.9  | Validate sidebar content is not empty                         | `.image-studio-sidebar__content` has text and/or form controls          |

**FAIL if:** Modal closes automatically, or image not saved to Media Library

**Note:** The success notice may not always be visible — verify save by checking that the Media Library item count increased and the new image appears at the top of the list.
**Note:** Steps 7.6-7.9 specifically validate metadata behavior on a **newly generated image**.

---

## Section 8: Hash Deep-Link

**Setup:** Need image ID from Media Library (e.g., `123`)

| Step | Action                                                                                         | Expected Result                                                                       |
| ---- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 8.1  | Navigate directly to: `wp-admin/upload.php#ai-image-editor=123` (replace `123` with actual ID) | Page loads, then Image Studio modal (`.image-studio-overlay`) auto-opens in Edit mode |
| 8.2  | Verify modal content                                                                           | Shows Edit Mode with the specified image loaded in canvas                             |

**FAIL if:** Modal doesn't open automatically, or wrong image loads

**Note:** This is the fallback entry point for Edit Mode if "Edit with AI" row action (Section 1.3) is missing. The JS that watches the hash may require the page to fully load first — wait 5+ seconds after navigation before declaring failure.

---

## Section 9: Block Editor — Generate Entry Point (DOM only)

**Setup:** Must have a post with content. Block editor content is inside `iframe[name="editor-canvas"]`. **No generation needed** — just verify the UI integration.

| Step | Action                                                                               | Expected Result                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9.1  | Go to Posts → Add New (or edit existing post)                                        | Block Editor loads                                                                                                                                                              |
| 9.2  | Add Paragraph block with text: "sunset over mountains" (inside iframe)               | Text appears in editor                                                                                                                                                          |
| 9.3  | In the iframe, click inline **"Add block"** and choose **Image**                     | Empty Image block with placeholder appears                                                                                                                                      |
| 9.4  | Verify **"Generate Image"** button exists in Image block placeholder (inside iframe) | Button present in DOM                                                                                                                                                           |
| 9.5  | Click **"Generate Image"**                                                           | Image Studio opens in Generate mode (`.image-studio-overlay` visible)                                                                                                           |
| 9.6  | Wait 5 seconds, then verify prompt suggestions are context-aware                     | Suggestion chips relate to post content (e.g., contain "sunset" or "mountain"). **Soft assertion** — chips may be empty or generic from block editor context; do not hard-fail. |
| 9.7  | Verify chat input, Style selector, Aspect Ratio selector present                     | `textarea`, Style button ("None"), Aspect Ratio button all in DOM                                                                                                               |
| 9.8  | Click **Close (X)** to exit without generating                                       | Modal closes, back to block editor                                                                                                                                              |

**FAIL if:** Generate Image button missing in block, or Image Studio doesn't open. Note: missing or non-contextual suggestions (9.6) is a **soft fail** — log it but don't block the test run.

**Note:** This section verifies the block editor integration only. Actual generation is tested in Section 6 from the Media Library.

---

## Section 10: Block Editor — Edit Entry Point (DOM only)

**Setup:** Must have post with existing Image block. **No generation needed** — just verify the entry point and modal state.

| Step | Action                                                                                                           | Expected Result                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 10.1 | Open post with existing Image block                                                                              | Block Editor loads with image visible                                              |
| 10.2 | If Image block is empty, click **Select Image** in placeholder, choose an image in media modal, click **Select** | Image is inserted into block                                                       |
| 10.3 | Select the Image block (click on it), then wait for block toolbar                                                | Block toolbar appears above image                                                  |
| 10.4 | Verify **"Edit with AI"** button in toolbar                                                                      | Button present in DOM with sparkles icon                                           |
| 10.5 | Click **"Edit with AI"**                                                                                         | Image Studio opens in Edit mode (`.image-studio-overlay` visible)                  |
| 10.6 | Verify image loaded in canvas                                                                                    | `.image-studio-image` visible, canvas not blank                                    |
| 10.7 | Verify Save button text                                                                                          | Shows **"Save & Apply"** (not just "Save") — confirms block editor context         |
| 10.8 | Verify chat input present                                                                                        | `textarea` with placeholder "Describe what you want to add, remove, or replace..." |
| 10.9 | Click **Close (X)** to exit without editing                                                                      | Modal closes, back to block editor, image block unchanged                          |

**FAIL if:** Edit button missing, wrong mode opens, "Save & Apply" missing, or image not loaded in canvas

---

## Section 11: Navigation Arrows (Image Browsing)

**Setup:** Must be in Edit Mode with Image Info sidebar open. Navigation pill (`.image-studio-header__navigation-pill`) shows in the header center.

| Step | Action                                              | Expected Result                                                                                                                          |
| ---- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 11.1 | Look at header center area                          | Navigation pill visible: **left arrow** (`aria-label="Previous image ⌘←"`), **filename**, **right arrow** (`aria-label="Next image ⌘→"`) |
| 11.2 | Click **right arrow** (next image)                  | Canvas updates to show the next image from Media Library; filename changes                                                               |
| 11.3 | Click **left arrow** (previous image)               | Canvas updates to show the previous image; filename changes back to original                                                             |
| 11.4 | Make an edit (modify Title), then click a nav arrow | Navigation should be **disabled** while unsaved changes exist (tooltip: "Save or discard your changes")                                  |

**FAIL if:** Navigation arrows missing, images don't change, or unsaved changes don't block navigation

---

## Section 12: Delete Permanently

**Setup:** Must be in Edit Mode with Image Info sidebar (`.image-studio-sidebar`) open. Use a test/disposable image (not one you need to keep).

| Step | Action                                                          | Expected Result                                                                                                                                                             |
| ---- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 | Open Image Info sidebar                                         | Sidebar visible with metadata fields                                                                                                                                        |
| 12.2 | Scroll to bottom of sidebar                                     | **"Delete permanently"** link visible (red destructive style, `.components-button.is-destructive`)                                                                          |
| 12.3 | Click **"Delete permanently"**                                  | Confirmation dialog appears (`.image-studio-confirmation-dialog-content`)                                                                                                   |
| 12.4 | Examine dialog content                                          | Title: **"Delete this item"**; Text: "You are about to permanently delete this item..."; Buttons: **"Cancel"** (secondary), **"Delete permanently"** (primary, destructive) |
| 12.5 | Click **"Cancel"**                                              | Dialog closes, image still visible, nothing deleted                                                                                                                         |
| 12.6 | Click **"Delete permanently"** again to reopen dialog           | Dialog appears again                                                                                                                                                        |
| 12.7 | Click **"Delete permanently"** (red button) in dialog           | Dialog closes, exit overlay appears, modal closes, image removed from Media Library                                                                                         |
| 12.8 | Verify in Media Library                                         | Deleted image no longer appears in the list; item count decreased by 1                                                                                                      |
| 12.9 | Make an edit (modify Title without saving), check Delete button | **"Delete permanently"** button should be **disabled** (tooltip: "Save or discard your changes")                                                                            |

**FAIL if:** Delete button missing, no confirmation dialog, cancel doesn't work, image not actually deleted, or delete is allowed with unsaved changes

**Warning:** This test permanently deletes an image. Use a test image you can afford to lose.

---

## Troubleshooting

### Known Flaky Areas

Use `⚠️ Partial` for these when behavior is intermittent and reproducible retries still fail.
These flake notes apply to **sandbox test runs** (e.g., `*.sandbox.wordpress.com`) and should not be assumed for production without re-validation.

- **Section 9 (Block Editor - Generate Entry Point):** The Image block may intermittently not expose **Generate Image** inside `iframe[name="editor-canvas"]`, even after valid setup.
  - Retry once after re-selecting/re-inserting the Image block.
  - If still missing, report as `⚠️ Partial (flaky Section 9)`.
- **Section 10 (Block Editor - Edit Entry Point):** Depends on Section 9 setup and an inserted/selectable image block.
  - If Section 9 is flaky/blocked, report Section 10 as `⚠️ Partial (blocked by Section 9)` instead of a hard fail.
- **Section 6 (Prompt & AI Response):** Backend generation may intermittently time out with no explicit streaming error.
  - Follow the existing retry-once rule, then report as `⚠️ Partial (backend flake)` if both attempts fail.

| Issue                                        | Check                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **"Generate Image" button not visible**      | Confirm you're on Media Library page (`upload.php`), not a post edit screen                                                  |
| **"Edit with AI" not in row actions**        | Confirm you're in List view, not Grid view. If still missing, use hash deep-link (Section 8) instead                         |
| **AI generation hangs**                      | Check DevTools Console for API errors; wait up to 50 seconds, then retry once                                                |
| **Streaming error during generation**        | May be a transient backend issue. Retry once. More common from block editor context than Media Library                       |
| **Block Editor doesn't load**                | Try refreshing; check for JavaScript errors in console                                                                       |
| **Hash deep-link not working**               | Verify ID is correct; check URL format is exactly `#ai-image-editor=123`; wait for full page load                            |
| **Section 4 reopen inconsistent**            | Reopen by the captured attachment ID (hash or exact row selector), not by “first row” which may change order                 |
| **Can't interact with block editor content** | Content is inside `iframe[name="editor-canvas"]` — use iframe-aware interaction methods                                      |
| **Section 9/10 cannot find Image actions**   | Insert Image block via iframe inline **Add block** button first. `Edit with AI` appears only after a real image is selected. |
| **Suggestion chip doesn't generate**         | Chips only populate the input; press Enter or click send button to start generation                                          |
| **"AI Editor" sidebar opens site editor**    | This is expected — it links to the site editor (`site-editor.php`), not Image Studio edit mode                               |
| **Modal intercepts clicks on background**    | Target elements inside `.image-studio-modal__content` specifically; use JS evaluate as fallback                              |

---

## Test Output Template

```
## Image Studio UI Smoke Test Results

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Branch:** forno-194/image-studio-feature-parity
**Site:** https://[site].wordpress.com

### Results Summary
- Total Sections: 12
- Passed: [N]
- Partial: [N]
- Failed: [N]
- Untestable: [N]

### Section Results

| Section | Status | Notes |
|---------|--------|-------|
| 1. Media Library Entry Points | ✅/⚠️/❌ | [Details if failed] |
| 2. Edit Mode | ✅/⚠️/❌ | [Details if failed] |
| 3. Sidebar & Metadata | ✅/⚠️/❌ | [Details if failed] |
| 4. Unsaved Changes Dialog | ✅/⚠️/❌ | [Details if failed] |
| 5. Generate Mode | ✅/⚠️/❌ | [Details if failed] |
| 6. Prompt & AI Response | ✅/⚠️/❌ | [Details if failed] |
| 7. Save Flow | ✅/⚠️/❌ | [Details if failed] |
| 8. Hash Deep-Link | ✅/⚠️/❌ | [Details if failed] |
| 9. Block Editor — Generate | ✅/⚠️/❌ | [Details if failed] |
| 10. Block Editor — Edit | ✅/⚠️/❌ | [Details if failed] |
| 11. Navigation Arrows | ✅/⚠️/❌ | [Details if failed] |
| 12. Delete Permanently | ✅/⚠️/❌ | [Details if failed] |

### Console Errors (if any)
```

[Paste relevant errors]

```

### Failed DOM Assertions (if any)
- Step X.X: Expected `.selector` to be visible, got `offsetHeight: 0`
- Step X.X: Expected `button` to be disabled, got `disabled: false`
```

---

## Reporting Issues

For each failure, capture:

1. **Exact step** that failed
2. **DOM state** — what the selector returned vs. what was expected
3. **Browser DevTools Console** errors (if any, via `playwright_console_logs`)
4. **Entry point used** (row action, hash deep-link, block editor button, etc.)
