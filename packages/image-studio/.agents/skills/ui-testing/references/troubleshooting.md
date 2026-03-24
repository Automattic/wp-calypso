# Troubleshooting

## Known Flaky Areas

Use `⚠️ Partial` for these when behavior is intermittent and reproducible retries still fail.
These flake notes apply to **sandbox test runs** (e.g., `*.sandbox.wordpress.com`) and should not be assumed for production without re-validation.

- **Section 9 (Block Editor - Generate Entry Point):** The Image block may intermittently not expose **Generate Image** inside `iframe[name="editor-canvas"]`, even after valid setup.
  - Retry once after re-selecting/re-inserting the Image block.
  - If still missing, report as `⚠️ Partial (flaky Section 9)`.
- **Section 10 (Block Editor - Edit Entry Point):** Depends on Section 9 setup and an inserted/selectable image block.
  - If Section 9 is flaky/blocked, report Section 10 as `⚠️ Partial (blocked by Section 9)` instead of a hard fail.
- **Section 6 (Prompt & AI Response):** Backend generation may intermittently time out with no explicit streaming error.
  - Follow the existing retry-once rule, then report as `⚠️ Partial (backend flake)` if both attempts fail.

## Common Issues

| Issue                                        | Check                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **"Generate Image" button not visible**      | Confirm you're on Media Library page (`upload.php`), not a post edit screen                                                  |
| **"Edit with AI" not in row actions**        | Confirm you're in List view, not Grid view. If still missing, use hash deep-link (Section 8) instead                         |
| **AI generation hangs**                      | Check DevTools Console for API errors; wait up to 50 seconds, then retry once                                                |
| **Streaming error during generation**        | May be a transient backend issue. Retry once. More common from block editor context than Media Library                       |
| **Block Editor doesn't load**                | Try refreshing; check for JavaScript errors in console                                                                       |
| **Hash deep-link not working**               | Verify ID is correct; check URL format is exactly `#ai-image-editor=123`; wait for full page load                            |
| **Section 4 reopen inconsistent**            | Reopen by the captured attachment ID (hash or exact row selector), not by "first row" which may change order                 |
| **Can't interact with block editor content** | Content is inside `iframe[name="editor-canvas"]` — use iframe-aware interaction methods                                      |
| **Section 9/10 cannot find Image actions**   | Insert Image block via iframe inline **Add block** button first. `Edit with AI` appears only after a real image is selected. |
| **Suggestion chip doesn't generate**         | Chips only populate the input; press Enter or click send button to start generation                                          |
| **"AI Editor" sidebar opens site editor**    | This is expected — it links to the site editor (`site-editor.php`), not Image Studio edit mode                               |
| **Modal intercepts clicks on background**    | Target elements inside `.image-studio-modal__content` specifically; use JS evaluate as fallback                              |
