# Experimental WebMCP tools

Agents Manager can expose abilities to browser agents through the draft WebMCP API. The browser
agent supplies the model and all reasoning, so a tool call doesn't create an Agenttic agent, open
Agents Manager chat, or call the WordPress.com AI orchestrator.

This is a staff-testing proof of concept, not a production-supported integration. It is off by
default, and turns on only when the Agents Manager inline data reports `isDevMode: true`, in a
browser that implements `document.modelContext.registerTool` (or the older
`navigator.modelContext`), on any screen where Agents Manager loads. Each tool shows only on its own
screens (see below).

## Execution and exposure

A client ability becomes a WebMCP tool when it sets `meta.webmcp.public: true`. It can come from
the merged `ToolProvider` of `loadExternalProviders()` or from the `@wordpress/abilities` registry
(`registry-ability-provider.ts`), so a plugin that isn't a provider can add a tool too, even on a
site with no agent provider. On a name clash, the provider's ability wins and runs through the
merged provider, which applies the provider precedence and the canvas guard. Registry-only abilities
run through the registry's `executeAbility()`.

An ability lists its screens as wp-admin screen IDs in `meta.webmcp.screens`, matched against
`window.pagenow` (`isAbilityOnCurrentScreen()` in `eligibility.ts`). Without the list, it belongs to
the block and site editors: a post, page, custom-post-type block editor or site editor screen,
detected by `isEditorPage()`. The allowlisted server abilities list none, so they stay in the
editors. Outside wp-admin there is no `pagenow`, so a listed ability never shows there.

`adapter.ts` builds, registers and syncs the tools. `tool-calls.ts` prepares each call's input
(`prepareToolInput()`), remembers the block-tree IDs (`rememberBlockClientIds()`) and adapts the
result (`adaptToolResult()`).

`withBlockEditCorrections()` (`block-edit-correction-provider.ts`) sends each block edit, with the
live block tree, to the server's `wpcom/correct-block-edits` before applying it, so it gets the
checks and fixes the chat's block edits get. It applies the corrected edits, or returns the server's
`unchanged` result or error without applying anything. It also refuses the edits if the editor moved
to another page meanwhile. Sites that don't serve the ability, such as Atomic sites, apply the edits
as sent.

Provider calls carry `toolCallId: null` (`withoutChatToolCalls()` in `non-chat-call-provider.ts`),
so a WebMCP edit takes no undo checkpoint and never adds to the chat's. A chat Undo still restores
its whole snapshot, so it also removes later edits to the same part of the page, the user's or a
WebMCP agent's. WebMCP edits stay unsaved for review, and block edits land on the editor's own undo
stack.

The allowlisted server abilities (`WEBMCP_SERVER_ABILITY_NAMES`) are fetched by
`withServerAbilities()` (`server-ability-provider.ts`) from `/wp-abilities/v1/abilities`
(`webmcp=1`), replace any same-named ability, and run against
`/wp-abilities/v1/abilities/{name}/run` over GET.

Client abilities must set the flag and carry a client callback. Server abilities must be in the
server allowlist, marked server-registered (which `withServerAbilities()` sets on what it fetches),
and annotated read-only. The flag doesn't expose a server-registered ability, and the server
allowlist doesn't expose a client one. A flagged ability off the server allowlist that isn't exposed
logs one `[AgentsManager]` console warning that says why.

WebMCP calls use the original slash-based ability name. The backend route settings don't apply
here: they scope only the agent's own tools.

A tool's description is its ability's own `description`, the text the Agents Manager agent also
reads when its route allows the ability. A client ability's `meta.instructions` stay with the chat.

A tool's annotations follow the WebMCP draft's `ToolAnnotations`. `readOnlyHint` comes from the
ability's `readonly` annotation. Every tool sets `untrustedContentHint`, because results carry site
content and other plugins' output, which Agents Manager can't vouch for. A tool sets
`consequentialHint` when its ability is annotated `destructive` or sets
`meta.webmcp.consequential: true`. No tool listed below does: their changes stay unsaved for review.
A tool sets `debugging` when its ability sets `meta.webmcp.debugging: true`. The draft has no
MCP-style `destructiveHint` or `idempotentHint`, so the `idempotent` annotation isn't sent.

Eligibility is checked once the providers load and whenever the scope or the loaded providers
change; such a change, or unmounting, aborts all registrations. While eligible, the adapter syncs
the tools whenever the `@wordpress/abilities` registry changes, which covers abilities registered
there by later React effects. Anything else, such as an ability only a provider lists, a server
ability fetch that failed or a tool the browser rejected, is picked up on the next registry or
scope change.

A rejected tool doesn't stop the others from registering. A call to a tool whose ability was
removed or is no longer exposed, or whose signal was aborted, is refused before it runs. An
in-flight provider execution cannot be cancelled, because `ToolProvider.executeAbility()` has no
signal.

The exposed tools are:

- `agents-manager/get-block-tree`: an Agents Manager-owned, client-only ability that reads the live
  Gutenberg tree. It returns real client IDs, block names, serializable attributes, nesting, the
  current selection, and a block count. WebMCP remembers these IDs for the matching
  edit call. It is annotated as read-only and idempotent.

- `agents-manager/get-editor-state`: an Agents Manager-owned, client-only ability that reads the
  post, page or template the editor has open, if any, with its saved status, and every record with
  unsaved changes, so the agent can tell the user what to review and save. It is annotated as
  read-only and idempotent.

- `big-sky/apply-block-edits`: an Agents Manager-owned, client-only ability that deterministically
  changes the current block-editor canvas. It does not save or publish the edit, so the result
  remains visible and reviewable. Its WebMCP contract supplies item-level schemas for updates,
  insertions, and deletions, accepts serialized Gutenberg block markup written by the agent as an
  insertion, strips internal-only arguments, and injects an identity mapping for IDs from the most
  recent block-tree read, which the callback resolves ahead of its own short ids. Read the block
  tree right before each edit, so its targets match the editor and the mapping is fresh.

- `big-sky/show-template`: an Agents Manager-owned, client-only ability that turns on the editor's
  Show template mode. Use it when the block-tree result does not contain the requested header or
  footer, then read the tree again before editing. Repeated calls are safe, and it does not save or
  publish content. WebMCP translates the ability's Big Sky-specific next-step reference
  to `agents_manager__get_block_tree`.

- `big-sky/apply-update-theme`: an Agents Manager-owned, client-only ability that merges theme.json
  `settings` and `styles` into the site's global styles record. The change previews in the editor
  and stays unsaved.

- `big-sky/edit-entity-record`: an Agents Manager-owned ability that, through WebMCP, only changes
  the title or excerpt of the post or page open in the editor. The full ability also creates,
  deletes and saves records across the site, so the WebMCP contract replaces its schema with
  `title` and `excerpt` alone, and WebMCP targets the open post itself, refusing anything else.
  The edit stays unsaved. Renaming a page also relabels the navigation menu items that point to it,
  as it does in chat.

- `big-sky/set-site-logo`: an Agents Manager-owned, client-only ability that points the site logo
  at an image in the media library, by attachment ID. The agent finds or uploads the image with
  the WordPress.com MCP media tools first. The change previews wherever the page has a Site Logo
  block and stays unsaved.

- `wpcom/get-block-schemas`, `wpcom/get-content-guidelines`, and `core/get-site-info`:
  read-only server abilities that `withServerAbilities()` fetches from the current site's Abilities
  REST API. Their existing input schemas, permission checks, and authenticated site-specific
  execution path are preserved. Their WebMCP descriptions also include each ability's
  server-provided instructions when present.

## Adding a tool

Expose a tool here only if it needs the open page: it reads or changes the live page state, such as
the editor's, or its result feeds an edit on the canvas. General site and account operations, such
as listing posts or reading stats, belong in the WordPress.com MCP server, and a second copy here
only makes the agent choose between two names for the same call. Keep saving and publishing a user
action: a tool that saves as a side effect, such as `big-sky/editor-navigate`, does not belong here.

To add another tool, verify its complete implementation, permissions, annotations, and execution
path. Set `meta.webmcp.public: true` on a client ability with a callback, or add a REST-backed tool
to `WEBMCP_SERVER_ABILITY_NAMES` (`contracts.ts`). If the tool's action is significant or can't be
undone, such as sending a message or refunding an order, also set `meta.webmcp.consequential: true`,
so a browser agent can ask the user to confirm it first. If the tool is for debugging or developer
tooling rather than for end users, set `meta.webmcp.debugging: true`.

For a tool on another wp-admin screen, load Agents Manager there with Jetpack's
`agents_manager_should_load` filter, and list the screen's ID in `meta.webmcp.screens`, for example
`[ 'woocommerce_page_wc-orders' ]`. Get the ID from `window.pagenow` in the browser console on that
screen, or from `get_current_screen()->id` in PHP. Without the list, the tool stays in the editors,
and that screen hides it without a warning.

Calypso and the Dashboard don't offer WebMCP tools yet, because they set neither `isDevMode` nor
`pagenow`. To add them, give `isWebMcpExperimentEnabled()` a dev-mode source there, and let
`isAbilityOnCurrentScreen()` match `screens` against the app's own screen ID, prefixed so it can't
clash with a wp-admin one (for example `calypso:plugins`). Tools keep the same `meta.webmcp.screens`
field.

Write the ability's `description` for both agents: name another tool only if both have it, or if
only browser agents read the description, as with `big-sky/apply-block-edits`.

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

1. Ask the agent which tools the page offers. Confirm it finds all ten:
   `agents_manager__get_block_tree`, `agents_manager__get_editor_state`, `big_sky__show_template`,
   `big_sky__apply_block_edits`, `big_sky__apply_update_theme`, `big_sky__edit_entity_record`, and
   `big_sky__set_site_logo`, plus `wpcom__get_block_schemas`, `wpcom__get_content_guidelines`, and
   `core__get_site_info`.
2. Ask the agent to read the block tree. If a requested template part is absent, confirm it calls
   `big_sky__show_template`, then reads the tree again.
3. Ask the agent to change a block, or insert a small test block on an empty page. Confirm it uses a
   client ID from the latest tree, and that the expected block and attributes are on the canvas.
   Ask it to delete the only button in a buttons block, and confirm the whole buttons block goes, as
   `wpcom/correct-block-edits` corrects it.
4. Ask the agent to add a section, such as a heading and a paragraph, as block markup. Confirm it
   passes the markup to `big_sky__apply_block_edits` as `inserts[0].blockMarkup` and that the blocks
   appear on the canvas in order.
5. Ask the agent to rename the open post or page with `big_sky__edit_entity_record`. Confirm the
   title changes in the editor and the post is not saved. Ask it to rename a different page, or to
   delete or publish one, and confirm the tool refuses.
6. Ask the agent what is unsaved. Confirm it calls `agents_manager__get_editor_state`, names the
   open post or page and its status, and lists the renamed post as unsaved.
7. Ask the agent to change the site's background color with `big_sky__apply_update_theme`. Confirm
   the canvas previews the new color and the global styles are not saved.
8. Ask the agent to set the site logo to an image from the media library. Confirm it calls
   `big_sky__set_site_logo` with that image's attachment ID, the Site Logo block previews it, and
   the site settings are not saved.
9. Do not publish the page. Discard the test changes or remove any auto-draft the editor created.

### From the console

1. Without opening Agents Manager chat, enumerate the page's tools through
   `document.modelContext.getTools()`.
2. Confirm the same ten tools are present, that the three server tools expose input schemas, and
   that each tool's `annotations` have `untrustedContentHint: true` and `consequentialHint: false`.
3. Call `agents_manager__get_block_tree`, choose a returned client ID, then call
   `big_sky__apply_block_edits` with that ID and a small reversible edit. Confirm the canvas changes
   without publishing the page.
4. Register a flagged ability with a callback, for example with
   `wp.data.dispatch( 'core/abilities' ).registerAbility()` and `meta: { webmcp: { public: true } }`
   (its category must be registered first). Confirm it appears as a tool without a reload, and
   disappears when it is unregistered. Register one without a callback, and confirm it stays
   absent and logs one `[AgentsManager]` warning that says why.
5. Confirm the Network panel shows no Agenttic/orchestrator/model request.
6. Navigate to another editor/site and confirm the tool now targets only the current canvas.
7. On a wp-admin screen outside the editors where Agents Manager loads, such as Plugins on a
   WordPress.com site, repeat step 4 with that screen's ID added to `meta.webmcp`, such as
   `screens: [ 'plugins' ]`. Confirm it appears as a tool and that the ten editor tools don't.
   Repeat it without `screens`, and with another screen's ID, and confirm the tool stays absent
   without a warning.
8. Force `isDevMode: false` in the inline data and reload; confirm the tools are absent.
