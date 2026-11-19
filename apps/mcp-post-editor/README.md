# MCP post editor

The WordPress.com post editor as an MCP App, shown inside ChatGPT and Claude. wpcom's MCP server returns the `ui://wpcom/post-editor/<version>` resource for the `wpcom-post-editor-open` tool. That resource is a small HTML shell that loads both `https://widgets.wp.com/mcp-post-editor/mcp-post-editor.css` and `https://widgets.wp.com/mcp-post-editor/mcp-post-editor.min.js`. wpcom reads `version` from `mcp-post-editor.asset.json`.

The page is a block editor for the post, in the site's look, without the block editor's iframe (MCP hosts' CSP blocks it). It loads the site's styles with `wpcom-post-editor-config` and polls `wpcom-post-editor-state` every 2 seconds. Typing is sent with `wpcom-post-editor-update` after a 1 second pause. Changes from the server are merged into the user's typing by `editor/merge.ts`, which documents its rules. When the host can't call tools from the panel, the post shows read-only.

The panel opens inline, and Expand asks the host for fullscreen.

Every dependency, including `@modelcontextprotocol/ext-apps` and the block editor, is bundled into the one script and stylesheet: the page runs in the host's sandboxed iframe, with no WordPress scripts.

`yarn test-apps apps/mcp-post-editor` runs the merge tests.

## Development

1. Sandbox `widgets.wp.com` and `public-api.wordpress.com`.
2. `cd apps/mcp-post-editor && yarn dev --sync` builds on change and rsyncs `dist/` to `/home/wpcom/public_html/widgets.wp.com/mcp-post-editor` on your sandbox.
3. For a one-off production build and sync, run `NODE_ENV=production yarn dev --sync --no-watch`.

`yarn build` makes a production build in `dist/` without syncing.

The host caches the page by its `ui://wpcom/post-editor/<version>` URI. After a new build, start a new chat to load it.

### Testing in Claude

Start a new Code tab session with the WordPress.com connector enabled, and ask Claude to open a post in the editor.

### Testing in ChatGPT

Add the WordPress.com MCP server as a developer connector, start a new chat with it, and ask ChatGPT to open a post in the editor.

## Deployment

1. Merge to `trunk`. TeamCity's "Build Calypso Apps" produces `mcp-post-editor.zip`, tagged `mcp-post-editor-release-build`.
2. On a sandbox: `bin/install-plugin.sh mcp-post-editor --release`, push the branch to the WPCOM repository when prompted, and merge the resulting PR. This is how the other `widgets.wp.com` apps are released.
   These steps don't work yet: wpcom's `bin/install-plugin.sh` has no `mcp-post-editor` entry. A wpcom PR adds it, with `widgets.wp.com/mcp-post-editor` as its files and `mcp-post-editor-release-build` as its TeamCity tag.
3. `deploy wpcom`.

The new `version` in `mcp-post-editor.asset.json` gives the page a new `ui://` URI, so hosts load the new build in new chats.
