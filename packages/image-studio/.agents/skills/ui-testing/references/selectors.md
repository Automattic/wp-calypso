# CSS Selectors & Aria Labels Reference

Use these selectors for automated testing with Playwright.

## Media Library Page

| Element                | Selector                                                                       |
| ---------------------- | ------------------------------------------------------------------------------ |
| Generate Image button  | `.big-sky-image-studio-link` or `.page-title-action.big-sky-image-studio-link` |
| List view toggle       | `.view-switch-list` or `button[id="view-switch-list"]`                         |
| Row actions (on hover) | `.wp-list-table tbody tr td.title .row-actions`                                |
| Image title link       | `.wp-list-table tbody tr td.title a`                                           |

## Image Studio Modal (shared across modes)

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

## Sidebar (Image Info)

| Element               | Selector                         |
| --------------------- | -------------------------------- |
| Sidebar container     | `.image-studio-sidebar`          |
| Sidebar header        | `.image-studio-sidebar__header`  |
| Sidebar content       | `.image-studio-sidebar__content` |
| Modal sidebar wrapper | `.image-studio-modal__sidebar`   |

## Generate Mode (Chat / AI Agent)

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

## Confirmation Dialog (Unsaved Changes)

| Element        | Selector                                    |
| -------------- | ------------------------------------------- |
| Dialog content | `.image-studio-confirmation-dialog-content` |

## Canvas

| Element       | Selector                     |
| ------------- | ---------------------------- |
| Image display | `.image-studio-image`        |
| Exit overlay  | `.image-studio-exit-overlay` |

## Block Editor

| Element                   | Selector                                                   |
| ------------------------- | ---------------------------------------------------------- |
| Editor content iframe     | `iframe[name="editor-canvas"]`                             |
| Block Inserter button     | `aria-label="Block Inserter"`                              |
| Image block placeholder   | `[data-type="core/image"]` (inside editor iframe)          |
| Generate Image (in block) | `button:has-text("Generate Image")` (inside editor iframe) |
