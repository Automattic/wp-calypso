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

## Test Surfaces

Test the Help Center on **both** surfaces, one at a time:

1. **Calypso Dashboard**: `https://my.wordpress.com/sites`
2. **WP Admin**: `https://en.support.wordpress.com/wp-admin/`

For each surface, navigate to the URL, then open the Help Center by clicking the `?` icon in the top bar.

## Test Checklist

For each surface, verify all of the following:

### 1. Home Screen
- Layout renders correctly (no overlapping, no broken spacing).
- Recommended/contextual guides are shown (WP Admin should show WP Admin-specific guides).
- Recent conversation card appears if there is conversation history.
- Search bar is visible and functional.

### 2. Search
- Type a real query (e.g., "domain") and verify results appear with titles and descriptions.
- Clear the search and type gibberish (e.g., "xyzqwfoobar123") — verify empty state with fallback action (e.g., "Ask AI assistant" button).

### 3. Article Rendering
- Open a guide/article from the home screen or search results.
- Check that headings, images, videos, links, lists, collapsible sections, and embedded UI cards render correctly.

### 4. Support Assistant (AI Chat)
- Open the AI chat via "Get help" or similar entry point.
- Verify the greeting message renders correctly.
- Send a question (e.g., "How do I change my site title?").
- Verify the AI response renders correctly: text formatting, links, Sources dropdown, feedback icons (thumbs up/down).

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

## Taking Evidence

For every issue found during testing:

- **Visual/layout issues**: Take a **screenshot** using `mcp__claude-in-chrome__computer` with `action: screenshot`.
- **Behavior/interaction issues**: Record a **GIF** using `mcp__claude-in-chrome__gif_creator`. Capture extra frames before and after the action for smooth playback. Name it descriptively (e.g., "search-clear-button-bug.gif").

## Reporting Issues

After completing all tests, if issues were found:

1. Present a summary of all issues to the user.
2. Ask the user which **Linear project** to file them under (e.g., "Help Center Polish and Maintenance").
3. Use `ToolSearch` to load Linear tools: `+linear save issue`.
4. For each issue, create a Linear issue with `mcp__linear-server__save_issue` including:
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

     ### Screenshot
     <!-- evidence will be inserted here -->

     ### Surface
     - [X] Calypso Dashboard
     - [ ] WP Admin
     ```
   - **Team**: Ask user or default to "Dotcom Support Infrastructure" (DOTSUP).
   - **Project**: The project the user specified.

### Attaching evidence to Linear issues

After creating each Linear issue, attach the screenshot or GIF into the **Screenshot** section of the description. Both methods require the Linear issue to be open in a Chrome tab within the same tab group.

1. **Navigate to the Linear issue** in a Chrome tab (same tab group as the Help Center tab):
   ```
   https://linear.app/a8c/issue/<ISSUE-ID>
   ```
   Wait 3 seconds for the page to fully load.

2. Use `mcp__claude-in-chrome__read_page` with `filter: interactive` to locate the `textbox "Issue description"` element and click its ref.

3. **Place the cursor in the Screenshot section**: click on the "Screenshot" heading in the description, then press `End` followed by `Enter` to position the cursor below it.

#### For GIFs (preferred — direct drag-and-drop)

GIF recordings are scoped to the tab group, so they can be exported directly onto the Linear tab:

1. Record the GIF on the Help Center tab (start recording → perform actions → stop recording).
2. Export with `mcp__claude-in-chrome__gif_creator` using `action: export`, setting `tabId` to the **Linear tab** and `coordinate` to a point inside the **Screenshot** section of the description.
3. The GIF will be dropped directly into the description.

#### For screenshots (clipboard paste)

1. **Ensure the bug is visible** in the Chrome tab showing the Help Center.
2. **Capture the screen to the macOS clipboard**:
   ```bash
   screencapture -c
   ```
3. With the cursor positioned in the **Screenshot** section, press `Cmd+V` to paste.

#### Verification

Wait 3 seconds after attaching, then take a screenshot to confirm the image/GIF was embedded in the Screenshot section.

## Tips

- Use `mcp__claude-in-chrome__read_page` with `filter: interactive` to find clickable elements.
- Use `mcp__claude-in-chrome__find` for natural language element search (e.g., "Help Center close button").
- Use `mcp__claude-in-chrome__computer` with `action: left_click` and `ref` parameter to click elements by reference ID.
- Wait 2-5 seconds after navigation or actions for content to load before taking screenshots.
- If the Help Center closes unexpectedly, click the `?` icon again to reopen it.
