# Experimental WebMCP editor tools

Agents Manager can expose a small set of editor abilities to browser agents through the draft
WebMCP API. The browser agent supplies the model and all reasoning. This adapter does not create an
Agenttic agent, open Agents Manager chat, or call the WordPress.com AI orchestrator.

This is a staff-testing proof of concept, not a production-supported integration. It is disabled by
default. It is enabled only when the Agents Manager inline data reports `isDevMode: true`, on a
post, page, custom-post-type block editor or site editor screen (detected from the admin body
classes) in a browser that implements
`document.modelContext.registerTool` (or the older `navigator.modelContext` location).

## Execution and exposure

A client ability becomes a WebMCP tool when it sets `meta.webmcp.public: true`. It can come from
the merged `ToolProvider` of `loadExternalProviders()` or from the `@wordpress/abilities` registry
(`registry-ability-provider.ts`), so a plugin that isn't a provider can add a tool too. On a name
clash, the provider's ability wins and runs through the merged provider, which applies the provider
precedence and the canvas guard. Registry-only abilities run through the registry's
`executeAbility()`.

The allowlisted server abilities (`WEBMCP_SERVER_ABILITY_NAMES`) are fetched by
`createWebMcpToolProvider()` (`server-ability-provider.ts`) from `/wp-abilities/v1/abilities`
(`webmcp=1`), replace any same-named ability, and run against
`/wp-abilities/v1/abilities/{name}/run` over GET.

Client abilities must set the flag and be client-registered or carry a client callback. Server
abilities must be in the server allowlist, marked server-registered (which the WebMCP provider
sets on what it fetches), and annotated read-only. The flag doesn't expose a server-registered
ability, and the server allowlist doesn't expose a client one.

WebMCP calls use the original slash-based ability name. The backend route settings don't apply
here: they scope only the agent's own tools.

Eligibility is checked when Agents Manager mounts and whenever the scope or tool provider changes;
such a change, or unmounting, aborts all registrations. While eligible, the adapter also reconciles
whenever the `@wordpress/abilities` registry changes, which covers abilities registered there by
later React effects. Anything else, such as an ability only a provider lists, a server ability
fetch that failed or a tool the browser rejected, is picked up on the next registry or scope
change. A rejected tool doesn't stop the others from registering, and a call to a tool whose
ability was removed or is no longer exposed is refused until the next sync updates the tools. An
already-aborted tool execution is rejected, but an in-flight provider execution cannot currently be
cancelled because `ToolProvider.executeAbility()` has no signal.

The exposed tools are:

- `agents-manager/get-block-tree`: an Agents Manager-owned, client-only ability that reads the live
  Gutenberg tree. It returns real client IDs, block names, serializable attributes, nesting, the
  current selection, and a block count. The WebMCP adapter remembers these IDs for the matching
  edit call. It is annotated as read-only and idempotent.

- `big-sky/apply-block-edits`: a client-registered ability that deterministically changes the
  current block-editor canvas. It does not save or publish the edit, so the result remains visible
  and reviewable. Its WebMCP contract supplies item-level schemas for updates, insertions, and
  deletions, accepts serialized Gutenberg block markup written by the agent as an insertion, strips
  internal-only arguments, and injects an identity mapping for IDs from the most recent block-tree read. It is
  owned by Agents Manager (`abilities/apply-block-edits`), which resolves the supplied mapping
  ahead of its own short ids.

- `big-sky/show-template`: an Agents Manager-owned, client-only ability that turns on the editor's
  Show template mode. Use it when the block-tree result does not contain the requested header or
  footer, then read the tree again before editing. Repeated calls are safe, and it does not save or
  publish content. The WebMCP adapter translates the ability's Big Sky-specific next-step reference
  to `agents_manager__get_block_tree`.

- `big-sky/apply-update-theme`: an Agents Manager-owned, client-only ability that merges theme.json
  `settings` and `styles` into the site's global styles record. The change previews in the editor
  and stays unsaved.

- `big-sky/edit-entity-record`: an Agents Manager-owned ability that, through WebMCP, only changes
  the title or excerpt of the post or page open in the editor. The full ability also creates,
  deletes and saves records across the site, so the WebMCP contract replaces its schema with
  `title` and `excerpt` alone, and the adapter targets the open post itself, refusing anything else.
  The edit stays unsaved. Renaming a page also relabels the navigation menu items that point to it,
  as it does in chat.

- `big-sky/set-site-logo`: an Agents Manager-owned, client-only ability that points the site logo
  at an image in the media library, by attachment ID. The agent finds or uploads the image with
  the WordPress.com MCP media tools first. The change previews wherever the page has a Site Logo
  block and stays unsaved.

- `wpcom/get-block-schemas`, `wpcom/get-content-guidelines`, and `core/get-site-info`:
  read-only server abilities fetched by the WebMCP provider from the current site's Abilities REST
  API. Their existing input schemas, permission
  checks, and authenticated site-specific execution path are preserved. The adapter also includes
  each ability's server-provided instructions in the WebMCP description when present.

The edit tool should be preceded by a fresh block-tree read. This keeps its targets aligned with the
current editor and refreshes the identity map the callback resolves through.

## Adding a tool

Expose a tool here only if it needs the open page: it reads or changes the live editor state, or its
result feeds an edit on the canvas. General site and account operations, such as listing posts or
reading stats, belong in the WordPress.com MCP server, and a second copy here only makes the agent
choose between two names for the same call. Keep saving and publishing a user action: a tool that
saves as a side effect, such as `big-sky/editor-navigate`, does not belong here.

To add another tool, verify its complete implementation, permissions, annotations, and execution
path. Set `meta.webmcp.public: true` on a client ability, or add a REST-backed tool to
`WEBMCP_SERVER_ABILITY_NAMES` (`contracts.ts`).

## Testing

### Setup

1. Sandbox `widgets.wp.com` and run `yarn dev --sync` from `apps/agents-manager`.
2. Use a browser with WebMCP, such as Chrome with `chrome://flags/#enable-webmcp-testing` on or an
   agent's built-in browser that supports it, and sign in to a test WordPress.com account there.
3. Open a post, page, or site editor where the inline Agents Manager data has `isDevMode: true`,
   for example on the Automattic proxy.

### With a browser agent

Use any agent that can call the page's WebMCP tools, such as the Codex built-in browser. Don't use
DevTools or call `document.modelContext` directly for this path.

1. Ask the agent which tools the page offers. Confirm it finds all nine:
   `agents_manager__get_block_tree`, `big_sky__show_template`, `big_sky__apply_block_edits`,
   `big_sky__apply_update_theme`, `big_sky__edit_entity_record`, and `big_sky__set_site_logo`, plus
   `wpcom__get_block_schemas`, `wpcom__get_content_guidelines`, and `core__get_site_info`.
2. Call `agents_manager__get_block_tree`. If a requested template part is absent, call
   `big_sky__show_template`, then read the tree again.
3. Call `big_sky__apply_block_edits` with a client ID from the latest tree, or insert a small test
   block on an empty page. Read the tree one final time and confirm the expected block and
   attributes are present.
4. Ask the agent to add a section, such as a heading and a paragraph, as block markup. Confirm it
   passes the markup to `big_sky__apply_block_edits` as `inserts[0].blockMarkup` and that the blocks
   appear on the canvas in order.
5. Ask the agent to rename the open post or page with `big_sky__edit_entity_record`. Confirm the
   title changes in the editor and the post is not saved. Ask it to rename a different page, or to
   delete or publish one, and confirm the tool refuses.
6. Ask the agent to change the site's background color with `big_sky__apply_update_theme`. Confirm
   the canvas previews the new color and the global styles are not saved.
7. Ask the agent to set the site logo to an image from the media library. Confirm it calls
   `big_sky__set_site_logo` with that image's attachment ID, the Site Logo block previews it, and
   the site settings are not saved.
8. Do not publish the page. Discard the test changes or remove any auto-draft the editor created.

### From the console

1. Without opening Agents Manager chat, enumerate the page's tools through
   `document.modelContext.getTools()`.
2. Confirm the same nine tools are present and that the three server tools expose input schemas.
3. Call `agents_manager__get_block_tree`, choose a returned client ID, then call
   `big_sky__apply_block_edits` with that ID and a small reversible edit. Confirm the canvas changes
   without publishing the page.
4. Confirm the Network panel shows no Agenttic/orchestrator/model request.
5. Navigate to another editor/site and confirm the tool now targets only the current canvas.
6. Force `isDevMode: false` in the inline data and reload; confirm the tools are absent.
