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

The adapter wraps the live merged `ToolProvider` from `loadExternalProviders()` in
`createWebMcpToolProvider()` (`server-ability-provider.ts`). Client abilities run through
the merged provider, which applies the established precedence and the canvas guard. The
allowlisted server abilities are fetched by the wrapper from `/wp-abilities/v1/abilities`
(`webmcp=1`), replace any same-named merged ability, and run directly against
`/wp-abilities/v1/abilities/{name}/run` over GET. WebMCP calls use the
original slash-based ability name. Both kinds are exposed to the browser agent without the backend
route settings, which scope only the agent's own tools.

The allowlist contains:

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

- `wpcom/get-block-schemas`, `wpcom/get-content-guidelines`, and `core/get-site-info`:
  read-only server abilities fetched by the WebMCP provider from the current site's Abilities REST
  API. Their existing input schemas, permission
  checks, and authenticated site-specific execution path are preserved. The adapter also includes
  each ability's server-provided instructions in the WebMCP description when present.

Client abilities must be in the editor allowlist and be client-registered or carry a client
callback. Server abilities must be in the separate server allowlist, marked server-registered
(which the WebMCP provider sets on what it fetches), and annotated read-only; neither allowlist grants eligibility to a lookalike from the other provenance.

## Testing

### Codex built-in browser

1. In the ChatGPT desktop app, open the built-in browser and sign in to the test WordPress.com
   account in that browser profile.
2. Sandbox `widgets.wp.com` and run `yarn dev --sync` from `apps/agents-manager`.
3. Open a post, page, or site editor where the inline Agents Manager data has `isDevMode: true`
   using GPT-5.6 Sol or Terra.
4. Ask Codex to inspect the current page's Site tools. Confirm it discovers all eight tools:
   `agents_manager__get_block_tree`, `big_sky__show_template`, `big_sky__apply_block_edits`,
   `big_sky__apply_update_theme`, and `big_sky__edit_entity_record`, plus
   `wpcom__get_block_schemas`, `wpcom__get_content_guidelines`, and `core__get_site_info`. Do not use DevTools or
   call `document.modelContext` directly for this path.
5. Call `agents_manager__get_block_tree`. If a requested template part is absent, call
   `big_sky__show_template`, then read the tree again.
6. Call `big_sky__apply_block_edits` with a client ID from the latest tree, or insert a small test
   block on an empty page. Read the tree one final time and confirm the expected block and
   attributes are present.
7. Ask the agent to add a section, such as a heading and a paragraph, as block markup. Confirm it
   passes the markup to `big_sky__apply_block_edits` as `inserts[0].blockMarkup` and that the blocks
   appear on the canvas in order.
8. Ask the agent to rename the open post or page with `big_sky__edit_entity_record`. Confirm the
   title changes in the editor and the post is not saved. Ask it to rename a different page, or to
   delete or publish one, and confirm the tool refuses.
9. Ask the agent to change the site's background color with `big_sky__apply_update_theme`. Confirm
   the canvas previews the new color and the global styles are not saved.
10. Do not publish the page. Discard the test changes or remove any auto-draft the editor created.

### Direct browser API fallback

1. Open a post, page, or site editor with `isDevMode: true` and the browser's WebMCP testing feature
   on.
2. Without opening Agents Manager chat, enumerate the page's tools through
   `document.modelContext.getTools()`.
3. Confirm the same eight tools are present and that the three server tools expose input schemas.
4. Call `agents_manager__get_block_tree`, choose a returned client ID, then call
   `big_sky__apply_block_edits` with that ID and a small reversible edit. Confirm the canvas changes
   without publishing the page.
5. Confirm the Network panel shows no Agenttic/orchestrator/model request.
6. Navigate to another editor/site and confirm the tool now targets only the current canvas.
7. Force `isDevMode: false` in the inline data and reload; confirm the tools are absent.

Eligibility is checked when Agents Manager mounts and whenever the scope or tool provider changes;
such a change, or unmounting, aborts all registrations. While eligible, the adapter reconciles the
provider every two seconds, which covers abilities registered by later React effects. An already-aborted tool execution is rejected, but an in-flight provider
execution cannot currently be cancelled because `ToolProvider.executeAbility()` has no signal.

The edit tool should be preceded by a fresh block-tree read. This keeps its targets aligned with the
current editor and refreshes the identity map the callback resolves through.

Expose a tool here only if it needs the open page: it reads or changes the live editor state, or its
result feeds an edit on the canvas. General site and account operations, such as listing posts or
reading stats, belong in the WordPress.com MCP server, and a second copy here only makes the agent
choose between two names for the same call. Keep saving and publishing a user action: a tool that
saves as a side effect, such as `big-sky/editor-navigate`, does not belong here.

To add another tool, verify its complete implementation, permissions, annotations, and execution
path. Add client tools to `WEBMCP_EDITOR_ABILITY_ALLOWLIST` (`adapter.ts`) or REST-backed tools to
`WEBMCP_SERVER_ABILITY_NAMES` (`contracts.ts`), with tests proving the opposite provenance and unlisted abilities
remain excluded.
