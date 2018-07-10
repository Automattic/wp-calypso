# Raw Handling (Paste)

This folder contains all paste specific logic (filters, converters, normalisers...). Each module is tested on their own, and in addition we have some integration tests for frequently used editors.

## Support table

| Source           | Formatting | Headings | Lists | Image | Separator | Table |
| ---------------- | ---------- | -------- | ----- | ----- | --------- | ----- |
| Google Docs      | ✓          | ✓        | ✓     | ✓     | ✓         | ✓     |
| Apple Pages      | ✓          | ✘ [1]    | ✓     | ✘ [1] | n/a       | ✓     |
| MS Word          | ✓          | ✓        | ✓     | ✘ [2] | n/a       | ✓     |
| MS Word Online   | ✓          | ✘ [3]    | ✓     | ✓     | n/a       | ✓     |
| Evernote         | ✓          | ✘ [4]    | ✓     | ✓     | ✓         | ✓     |
| Markdown         | ✓          | ✓        | ✓     | ✓     | ✓         | ✓     |
| Legacy WordPress | ✓          | ✓        | ✓     | … [5] | ✓         | ✓     |
| Web              | ✓          | ✓        | ✓     | ✓     | ✓         | ✓     |


1. Apple Pages does not pass heading and image information.
2. MS Word only provides a local file path, which cannot be accessed in JavaScript for security reasons.
3. Still to do for MS Word Online.
4. Evernote does not have headings.
5. For caption and gallery shortcodes, see #2874.

## Other notable capabilities

* Filters out analytics trackers in the form of images.
* Direct image data pasting coming soon.
