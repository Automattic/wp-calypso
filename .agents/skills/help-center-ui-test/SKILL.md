---
name: help-center-ui-test
description: Run a browser-based UI review of the WordPress.com Help Center across multiple surfaces, looking for visual and behavioral issues. Use when asked to test the Help Center UI.
allowed-tools: Read, Glob, Grep, AskUserQuestion, Bash, Agent, ToolSearch
---

# Help Center UI Test

Performs a systematic browser-based UI review of the Help Center using Chrome automation (Claude in Chrome extension).

## Prerequisites

- The **Claude in Chrome** browser extension must be installed and connected. Run `/chrome` in Claude Code if not connected.
- The user must be logged into WordPress.com in Chrome.

## Setup

1. Use `ToolSearch` to load Chrome tools: `select:mcp__claude-in-chrome__tabs_context_mcp`.
2. Call `mcp__claude-in-chrome__tabs_context_mcp` to get current tabs.
3. Create a new tab with `mcp__claude-in-chrome__tabs_create_mcp`.

## Error Monitoring

After opening the Help Center on each surface, and after key interactions, check for errors:

- **Console errors**: Call `mcp__claude-in-chrome__read_console_messages` with `pattern: "(error|Error|ERROR)"` to capture JS errors.
- **Network errors**: Call `mcp__claude-in-chrome__read_network_requests` and check for any requests with HTTP status >= 400.

Check for errors at these points:

1. After opening the Help Center on each surface.
2. After performing a search.
3. After loading an article.
4. After receiving an AI chat response.
5. After initiating a support handoff.
6. At the end of each surface's tests (final error sweep).

Log any errors found as issues in the test results, categorized as "Console Error" or "Network Error".

## Test Surfaces

Test the Help Center on **both** surfaces, one at a time:

1. **Calypso Dashboard**: `https://my.wordpress.com/sites`
2. **WP Admin**: `https://en.support.wordpress.com/wp-admin/`
3. **Editor**: `https://en.support.wordpress.com/wp-admin/post-new.php`

For each surface:

1. Navigate to the URL.
2. Use `mcp__claude-in-chrome__find` to locate the `?` help icon. If not found, wait 3 seconds with `mcp__claude-in-chrome__computer` (`action: wait`) and retry.
3. Click the `?` icon to open the Help Center.
4. Use `mcp__claude-in-chrome__find` to confirm the search bar or home screen content has appeared. If not found, wait 3 seconds and retry.

## Test Checklist

For each surface, verify all of the following:

### 1. Home Screen

- Layout renders correctly (no overlapping, no broken spacing).
- Recommended/contextual guides are shown (WP Admin should show WP Admin-specific guides).
- Recent conversation card appears if there is conversation history.
- Search bar is visible and functional.

### 2. Search

- Type a real query (e.g., "domain") and use `mcp__claude-in-chrome__find` to confirm search results have appeared. If not found, wait 3 seconds and retry. Verify results show titles and descriptions.
- Clear the search and type gibberish (e.g., "xyzqwfoobar123") — use `mcp__claude-in-chrome__find` to confirm the empty state has appeared. Verify a fallback action appears (e.g., "Ask AI assistant" button).

### 3. Article Rendering

- Open a guide/article from the home screen or search results.
- Use `mcp__claude-in-chrome__find` to confirm the article heading has rendered. If not found, wait 3 seconds and retry.
- Check that headings, images, videos, links, lists, collapsible sections, and embedded UI cards render correctly.

### 4. Support Assistant (AI Chat)

- Open the AI chat via "Get help" or similar entry point.
- Verify the greeting message renders correctly.
- Send a question (e.g., "How do I change my site title?").
- Use `mcp__claude-in-chrome__find` to confirm the AI response has appeared. If not found, wait 5 seconds and retry (AI responses may take longer).
- Verify the AI response renders correctly: text formatting, links, feedback icons (thumbs up, thumbs down, copy).
- Expand the **Sources** dropdown and verify it shows relevant documentation links.

### 5. Live Support Handoff

- In the AI chat, type "Talk with a human".
- Verify the AI offers a "Talk with a human" button or similar handoff mechanism.
- If prompted about an ongoing conversation, choose "No, connect me with someone new".
- Verify the transition: header changes to "Support Team", a "CHAT WITH SUPPORT TEAM STARTED" divider appears, the input field gains an attachment button.

### 6. Navigation

- **Back button**: navigates to the previous screen within the Help Center.
- **Close (X)**: closes the Help Center panel.
- **Minimize/Maximize**: Help Center can be minimized and restored.
- **Three-dot menu**: shows options (Minimize, New chat, Support history, Turn off sound notifications).

### 7. Support History

- Open Support history from the three-dot menu.
- Verify past conversations are listed.
- Click a conversation and verify it opens the correct one (not a different conversation).

## Viewport Testing

After completing the full test checklist at desktop size on each surface, test responsive layouts at additional viewports.

### Viewport Presets

| Name    | Width | Height |
|---------|-------|--------|
| Desktop | 1280  | 800    |
| Mobile  | 375   | 812    |

### Procedure

For each surface, after the desktop checklist is complete:

1. Use `mcp__claude-in-chrome__resize_window` to switch to **Mobile** (375x812).
2. Open the Help Center and verify:
   - Home Screen layout (no overlapping, no broken spacing, no horizontal overflow).
   - Search results layout.
   - Help Center panel sizing (doesn't overflow viewport).
3. Use `mcp__claude-in-chrome__resize_window` to restore **Desktop** (1280x800) before moving to the next surface.

## Test Results Format

Every test run must produce a structured summary using this format:

```markdown
## Test Results Summary

### Surface: [Calypso Dashboard / WP Admin]

| # | Check | Viewport | Status | Issue | Evidence |
|---|-------|----------|--------|-------|----------|
| 1 | Home Screen — layout | Desktop | PASS/FAIL | Description | screenshot.png |
| 2 | Home Screen — guides | Desktop | PASS/FAIL | Description | |
| ... | ... | ... | ... | ... | ... |

### Console & Network Errors

| Surface | Type | Message/URL | HTTP Status |
|---------|------|-------------|-------------|
| Calypso | Network | /wpcom/v2/help/search | 500 |
| WP Admin | Console | TypeError: ... | — |

### Overall: X passed, Y failed, Z errors
```

Only FAIL rows and errors should be filed as Linear issues.

## Taking Evidence

For every issue found during testing, record a **GIF** using `mcp__claude-in-chrome__gif_creator`:

1. Call `gif_creator` with `action: start_recording` on the Help Center tab.
2. Take a screenshot immediately after to capture the initial state as the first frame.
3. Perform the actions that demonstrate the issue (click, scroll, type, etc.).
4. Take a screenshot immediately before stopping to capture the final state.
5. Call `gif_creator` with `action: stop_recording`.

Name GIFs descriptively (e.g., "search-clear-button-bug.gif"). For static visual issues, a single-frame GIF (start → screenshot → stop) is sufficient.

## Reporting Issues

After completing all tests, if issues were found:

1. Present a summary of all issues to the user.
2. Ask the user if they would like to:
   - **File Linear issues** for the bugs found.
   - **Attempt to fix** the issues directly in the codebase.
   - Both (fix and file).
3. Default the **Linear project** to "Help Center Polish and Maintenance". Ask the user to confirm or pick a different one.
4. Use `ToolSearch` to load Linear tools: `+linear save issue`.
5. For each issue, create a Linear issue with `mcp__linear-server__save_issue` including:
   - **Title**: Clear, concise description of the bug.
   - **Description** (Markdown) — use this template:

     ```markdown
     ## Bug Report

     ### Steps to Reproduce
     1. ...

     ### Expected Behavior
     ...

     ### Actual Behavior
     ...

     ### Surface
     - [X] Calypso Dashboard
     - [ ] WP Admin
     ```

   - **Team**: Ask user or default to "Dotcom Support Infrastructure" (DOTSUP).
   - **Project**: The project the user specified.

### Fixing issues

If the user wants to attempt fixes:

1. Create a new branch named after the Linear issue ID (e.g., `git checkout -b DOTSUP-448`).
2. Investigate the root cause and implement a fix.
3. After fixing, ask the user if they want to commit and create a PR.

### Attaching evidence to Linear issues

After creating each Linear issue, attach the GIF to the description via drag-and-drop. GIF recordings are scoped to the tab group, so they can be exported directly onto the Linear tab.

1. **Navigate to the Linear issue** in a Chrome tab (same tab group as the Help Center tab):

   ```text
   https://linear.app/a8c/issue/<ISSUE-ID>
   ```

   Use `mcp__claude-in-chrome__find` to confirm the issue description is visible. If not found, wait 3 seconds and retry.

2. **Export the GIF** with `mcp__claude-in-chrome__gif_creator` using `action: export`, setting `tabId` to the **Linear tab** and `coordinate` to a point inside the issue description area. The GIF will be embedded in the description (exact placement within the description may vary).

3. **Verify**: Take a screenshot of the Linear tab to confirm the image was embedded.

## Tips

- Use `mcp__claude-in-chrome__read_page` with `filter: interactive` to find clickable elements.
- Use `mcp__claude-in-chrome__find` for natural language element search (e.g., "Help Center close button").
- Use `mcp__claude-in-chrome__computer` with `action: left_click` and `ref` parameter to click elements by reference ID.
- Use `mcp__claude-in-chrome__find` to confirm elements have appeared after actions instead of fixed-delay sleeps. If an element isn't found, wait 3 seconds with `mcp__claude-in-chrome__computer` (`action: wait`, `duration: 3`) and retry up to 3 times.
- If the Help Center closes unexpectedly, click the `?` icon again to reopen it.
