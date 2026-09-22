# Experimental WebMCP editor tools

Agents Manager can expose a small set of editor abilities to browser agents through the draft
WebMCP API. The browser agent supplies the model and all reasoning. This adapter does not create an
Agenttic agent, open Agents Manager chat, or call the WordPress.com AI orchestrator.

This is a staff-testing proof of concept, not a production-supported integration. It is disabled by
default. It is enabled only when the Agents Manager inline data reports `isDevMode: true`, on a
supported post, page, or site editor URL in a browser that implements
`document.modelContext.registerTool` (or the older `navigator.modelContext` location).

## Execution and exposure

The adapter uses the live merged `ToolProvider` returned by `loadExternalProviders()`. That provider
combines Agents Manager-owned abilities with external fallback providers, resolves duplicate names
using the established precedence, and applies the existing canvas guard. WebMCP calls execute with
the original slash-based ability name through `toolProvider.executeAbility()`. While the experiment
is eligible, the external provider's ability-setup hook also mounts at the stable Agents Manager
lifecycle so hook-dependent abilities can register without opening the chat route.

The allowlist contains:

- `agents-manager/get-block-tree`: an Agents Manager-owned, client-only ability that reads the live
  Gutenberg tree. It returns real client IDs, block names, serializable attributes, nesting, the
  current selection, and a block count. The WebMCP adapter remembers these IDs for the matching
  edit call. It is annotated as read-only and idempotent.

- `big-sky/apply-block-edits`: a client-registered ability that deterministically changes the
  current block-editor canvas. It does not save or publish the edit, so the result remains visible
  and reviewable. Its WebMCP contract supplies item-level schemas for updates, insertions, and
  deletions, accepts serialized Gutenberg pattern markup as an insertion, strips internal-only
  arguments, and injects an identity mapping for IDs from the most recent block-tree read. On
  current trunk it is owned by the Big Sky fallback provider; the
  merged-provider seam continues to work when ownership migrates to Agents Manager.

- `big-sky/show-template`: an Agents Manager-owned, client-only ability that turns on the editor's
  Show template mode. Use it when the block-tree result does not contain the requested header or
  footer, then read the tree again before editing. Repeated calls are safe, and it does not save or
  publish content. The WebMCP adapter translates the ability's Big Sky-specific next-step reference
  to `agents_manager__get_block_tree`.

- `wpcom/get-block-schemas`, `wpcom/get-content-guidelines`, `wpcom/get-posts`,
  `wpcom/get-site-stats`, `wpcom/patterns-list`, `wpcom/patterns-get`, and `core/get-site-info`:
  read-only server abilities registered by
  Gutenberg from the current site's Abilities REST API. Their existing input schemas, permission
  checks, and authenticated site-specific execution path are preserved. The adapter also includes
  each ability's server-provided instructions in the WebMCP description when present.

- `wpcom/media-create`: an explicitly allowlisted mutating server ability that uploads base64-encoded
  files to the site's media library after user confirmation. WebMCP sends its input as a JSON POST
  body and preserves its existing authentication, site capability, MIME validation, and size checks.

Client abilities must be in the editor allowlist and be client-registered or carry a client
callback. Server abilities must be in the separate server allowlist and marked server-registered;
neither allowlist grants eligibility to a lookalike from the other provenance.

## Testing

### Codex built-in browser

1. In the ChatGPT desktop app, open the built-in browser and sign in to the test WordPress.com
   account in that browser profile.
2. Sandbox `widgets.wp.com` to wpdev and run `WPCOM_SANDBOX=wpdev yarn dev --sync` from
   `apps/agents-manager`.
3. Open a post, page, or site editor where the inline Agents Manager data has `isDevMode: true`
   using GPT-5.6 Sol or Terra.
4. Ask Codex to inspect the current page's Site tools. Confirm it discovers all eleven tools:
   `agents_manager__get_block_tree`, `big_sky__show_template`, and
   `big_sky__apply_block_edits`, plus `wpcom__get_block_schemas`,
   `wpcom__get_content_guidelines`, `wpcom__get_posts`, `wpcom__get_site_stats`,
   `wpcom__media_create`, and
   `wpcom__patterns_list`, `wpcom__patterns_get`, and `core__get_site_info`. Do not use DevTools or
   call `document.modelContext` directly for this path.
5. Call `agents_manager__get_block_tree`. If a requested template part is absent, call
   `big_sky__show_template`, then read the tree again.
6. Call `big_sky__apply_block_edits` with a client ID from the latest tree, or insert a small test
   block on an empty page. Read the tree one final time and confirm the expected block and
   attributes are present.
7. Call `wpcom__patterns_list`, choose a pattern, and fetch it with `wpcom__patterns_get`. Pass its
   `content` to `big_sky__apply_block_edits` as `inserts[0].blockMarkup`, then confirm the pattern's
   blocks appear on the canvas in order.
8. After confirming the upload with the user, call `wpcom__media_create` with a small test image and
   confirm its returned attachment ID and URL exist in the site's media library. Delete the test
   attachment afterward.
9. Do not publish the page. Discard the test changes or remove any auto-draft the editor created.

### Direct browser API fallback

1. Open a post, page, or site editor with `isDevMode: true` and the browser's WebMCP testing feature
   on.
2. Without opening Agents Manager chat, enumerate the page's tools through
   `document.modelContext.getTools()`.
3. Confirm the same eleven tools are present and that the eight server tools expose input schemas.
4. Call `agents_manager__get_block_tree`, choose a returned client ID, then call
   `big_sky__apply_block_edits` with that ID and a small reversible edit. Confirm the canvas changes
   without publishing the page.
5. Confirm the Network panel shows no Agenttic/orchestrator/model request.
6. Navigate to another editor/site and confirm the tool now targets only the current canvas.
7. Force `isDevMode: false` in the inline data and reload; confirm the tools are absent.
8. Use `?am_abilities=0` to exercise the external-provider ownership path during migration.

The adapter reconciles the provider every two seconds only while the experiment is eligible. This
covers abilities registered by later React effects. Changing scope or unmounting Agents Manager
aborts all registrations. An already-aborted tool execution is rejected, but an in-flight provider
execution cannot currently be cancelled because `ToolProvider.executeAbility()` has no signal.

The edit tool should be preceded by a fresh block-tree read. This keeps its targets aligned with the
current editor and refreshes the identity map used by the Big Sky callback.

To add another tool, verify its complete implementation, permissions, annotations, and execution
path. Add client tools to `WEBMCP_EDITOR_ABILITY_ALLOWLIST` or REST-backed tools to
`WEBMCP_SERVER_ABILITY_NAMES`, with tests proving the opposite provenance and unlisted abilities
remain excluded.
