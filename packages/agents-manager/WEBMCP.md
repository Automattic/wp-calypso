# Experimental WebMCP editor tools

Agents Manager can expose editor abilities to browser agents through the [WebMCP draft](https://webmachinelearning.github.io/webmcp/). The
browser agent supplies the model and all reasoning. This adapter does not create an Agenttic agent,
open Agents Manager chat, or call the WordPress.com AI orchestrator.

This is a staff-testing proof of concept, not a production-supported integration. It is disabled by
default. It is enabled only when the Agents Manager inline data reports `isDevMode: true`, on a
supported post, page, or site editor URL in a browser that implements
`document.modelContext.registerTool` (or the older `navigator.modelContext` location).

## Sources and execution

Three sources feed one adapter. They are merged first-wins by ability name, in this order, and
the exposure policy runs on the winner, so a private winning definition also hides its same-named
fallbacks. The owner is resolved live at discovery and again at dispatch, as the chat provider
chain does:

1. The site's Abilities REST API, fetched once per adapter mount with `webmcp=1`. A REST definition replaces
   a same-named copy from the other sources and executes on the REST route: GET for read-only
   abilities, DELETE for non-read-only abilities whose `destructive` and `idempotent` annotations
   are both true, and POST otherwise. GET and DELETE carry input in the query; POST carries a JSON
   body. This follows [WordPress's method validation](https://developer.wordpress.org/reference/classes/wp_rest_abilities_v1_run_controller/validate_request_method/).
   Instructions are appended to the description unless an ability contract replaces it.
2. The merged `ToolProvider` returned by `loadExternalProviders()`. It combines Agents
   Manager-owned abilities with external fallback providers, resolves duplicate names using the
   established precedence, and applies the existing canvas guard. The abilities it lists execute
   through `toolProvider.executeAbility()` with the original slash-based name. While the
   experiment is eligible, the external provider's ability-setup hook also mounts at the stable
   Agents Manager lifecycle so hook-dependent abilities can register without opening the chat
   route.
3. The `core/abilities` client registry from `@wordpress/abilities`: everything the page
   registered, whichever plugin did it. These execute through the registry's `executeAbility()`,
   which runs the ability's permission callback and schema validation, under the same canvas
   guard.

The REST source is a local stand-in for `@wordpress/core-abilities`, the upstream loader that
fetches the same list on import and registers each ability into the `core/abilities` store with the
same request method rules. WordPress 7.0 and later register that loader as a script module, but
nothing loads it on editor pages, it keeps only the `annotations` part of an ability's `meta`, so
the `public`, `webmcp`, and `instructions` values never reach the store, and it cannot send the
`webmcp` query argument. Once the loader preserves `meta`, the wpcom abilities carry the WordPress
7.1 flags instead of the query argument, and the module is loaded on eligible editor pages, the
REST source and its tests can be deleted. The registry provider then splits into a
server-registered view ahead of the provider chain and a client-registered view behind it, which
keeps today's precedence.

The canvas guard covers specific known abilities, including `big-sky/apply-block-edits`; it does
not infer protection for arbitrary plugin writes. Every ability remains responsible for its own
permissions, target scoping, and validation. Exposure flags and browser annotations do not grant
authorization.

The merge lives in `src/webmcp/compose-tool-providers.ts` and mirrors the first-wins rule of the
chat provider chain without sharing code with it. Before dispatch, a tool resolves the live winning
definition and its owning source together. It rejects the call when that winner is gone, opted out,
or carries a different descriptor, then reconciles the tools so the browser can discover them
afresh. Execution uses that validated source without another cross-source lookup; a recovering
source or provider replacement takes effect on the next call. A winner that changed source but
kept an identical descriptor keeps its registration and executes through the new source. Callbacks
from replaced or disposed registrations reject. Within a call, each owner still dispatches by
ability name, because the `ToolProvider` contract and the registry's `executeAbility()` are
name-based, so an implementation swapped under the same name between validation and dispatch is
not caught until the next call; the store subscription reconciles the tools afterwards.

The adapter itself is generic. The few abilities whose projection differs from the ability, such
as the edit tool's WebMCP-only schema and input shaping, are described in one contract table in
`src/webmcp/contracts.ts`.

## Exposure

Every candidate goes through `shouldExposeWebMcpAbility()` in `src/webmcp/exposure.ts`, most
specific rule first:

1. `meta.webmcp.public` opts an ability in or out explicitly, for reads and writes alike. A
   malformed `meta.webmcp` value fails closed. This mirrors how the core MCP adapter reads
   `meta.mcp.public`.
2. `meta.public` opts in read-only abilities only in this experiment. This read-only restriction
   is Agents Manager policy, not a restriction of [WordPress 7.1's public flag](https://make.wordpress.org/core/2026/08/04/a-unified-public-exposure-flag-for-abilities-in-wordpress-7-1/).
   The generic flag does not opt out of the transitional allowlists: WordPress resolves it to
   `false` even when the author did not supply a value.
3. Otherwise the transitional allowlists decide: `WEBMCP_EDITOR_ABILITY_ALLOWLIST` for client
   abilities and `WEBMCP_SERVER_ABILITY_NAMES` for REST abilities, with
   `WEBMCP_MUTATING_SERVER_ABILITY_NAMES` naming the only allowlisted write.

Every rule also requires a known provenance. Client abilities must be client-registered or carry a
client callback, and server abilities must be marked server-registered; neither allowlist grants
eligibility to a lookalike from the other provenance.

The allowlisted tools are:

- `agents-manager/get-block-tree`: an Agents Manager-owned, client-only ability that reads the live
  Gutenberg tree. It returns real client IDs, block names, serializable attributes, nesting, the
  current selection, and a block count. The WebMCP adapter remembers these IDs for the matching
  edit call. It is annotated as read-only and idempotent.

- `big-sky/apply-block-edits`: a client-registered ability that deterministically changes the
  current block-editor canvas. It does not save or publish the edit, so the result remains visible
  and reviewable. Its WebMCP contract supplies item-level schemas for updates, insertions, and
  deletions, accepts serialized Gutenberg pattern markup as an insertion, strips internal-only
  arguments, and injects an identity mapping for IDs from the most recent block-tree read. On
  current trunk it is owned by the Big Sky fallback provider; the merged-provider seam continues
  to work when ownership migrates to Agents Manager.

- `big-sky/show-template`: an Agents Manager-owned, client-only ability that turns on the editor's
  Show template mode. Use it when the block-tree result does not contain the requested header or
  footer, then read the tree again before editing. Repeated calls are safe, and it does not save or
  publish content. The WebMCP adapter translates the ability's Big Sky-specific next-step reference
  to `agents_manager__get_block_tree`.

- `wpcom/get-block-schemas`, `wpcom/get-content-guidelines`, `wpcom/get-posts`,
  `wpcom/get-site-stats`, `wpcom/patterns-list`, `wpcom/patterns-get`, and `core/get-site-info`:
  read-only server abilities registered by Gutenberg from the current site's Abilities REST API.
  Their existing input schemas, permission checks, and authenticated site-specific execution path
  are preserved.

- `wpcom/media-create`: an explicitly allowlisted mutating server ability that uploads base64-encoded
  files to the site's media library after user confirmation. WebMCP sends its input as a JSON POST
  body and preserves its existing authentication, site capability, MIME validation, and size checks.

## Tool names and annotations

WebMCP tool names use the agent's form: `/` becomes `__` and `-` becomes `_`, so
`agents-manager/get-block-tree` is exposed as `agents_manager__get_block_tree`. That mapping is not
injective. When two eligible abilities land on the same tool name, neither is exposed and a warning
names them once.

Tools carry only the three annotations the WebMCP draft defines:

- `readOnlyHint` mirrors the ability's `readonly` annotation.
- `untrustedContentHint` is always true, because site content and third-party abilities are
  user-authored.
- `consequentialHint` marks actions a browser agent should confirm with the user before running.
  It is set by the contract table (`wpcom/media-create` persists an upload, while the editor edits
  stay unsaved and reversible), by `meta.webmcp.consequential: true`, or by the ability's
  `destructive` annotation.

The MCP-style `destructiveHint` and `idempotentHint` are not part of WebMCP and are not emitted.
A rejected registration is reported and retried with the complete descriptor on the next
reconcile. The experiment requires a browser that accepts the current draft's descriptor.

## Lifecycle

The adapter subscribes to the `core/abilities` store and reconciles on every change, so abilities
registered by later React effects or by other plugins appear without polling. The merged provider
lives outside that store, so the hook re-syncs once when it arrives. Changing scope or unmounting
Agents Manager aborts all registrations. A source that fails to load, a registration the browser
rejects, or an ability whose descriptor cannot be serialized, such as a cyclic schema, is reported
and does not block the remaining tools. A registered tool whose live descriptor stops being
serializable is removed. A failed REST discovery is not cached,
so the next reconcile fetches it again, whether a store change, a provider change, or a dispatch
that found a stale definition triggered it. There are no timed retries, and executions are never
retried automatically.

An execution aborted before dispatch is rejected, including cancellation while checking the live
definition. An in-flight provider execution cannot currently be cancelled because
`ToolProvider.executeAbility()` has no signal.

The edit tool should be preceded by a fresh block-tree read. This keeps its targets aligned with the
current editor and refreshes the identity map used by the Big Sky callback.

To expose another ability, prefer the flags: `meta.public` for a read, `meta.webmcp.public` for a
write, after verifying its complete implementation, permissions, annotations, and execution path.
Extend the allowlists only for abilities that cannot carry the flags yet, with tests proving the
opposite provenance and unlisted abilities remain excluded.

## Testing

### Automated

From the repository root:

```bash
yarn jest -c test/packages/jest.config.js --testPathPattern=agents-manager --runInBand
yarn typecheck-packages
NODE_OPTIONS=--max-old-space-size=8192 yarn typecheck-client
```

The regression suites cover source precedence and opt-outs, stale registrations, GET/POST/DELETE
routing, partial discovery failures, and disposal during registration.

### Codex built-in browser

1. In the ChatGPT desktop app, open the built-in browser and sign in to the test WordPress.com
   account in that browser profile.
2. Sandbox `widgets.wp.com` to wpdev and run `WPCOM_SANDBOX=wpdev yarn dev --sync` from
   `apps/agents-manager`.
3. Open a post, page, or site editor where the inline Agents Manager data has `isDevMode: true`
   using GPT-5.6 Sol or Terra.
4. Ask Codex to inspect the current page's Site tools. Confirm it discovers all eleven allowlisted
   tools: `agents_manager__get_block_tree`, `big_sky__show_template`, and
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

### Registry abilities

1. On an eligible editor, register a read-only client ability with `meta.public: true`, from a test
   plugin or from the console through `wp.data.dispatch( 'core/abilities' ).registerAbility()`
   after registering its category the same way. Confirm its tool appears in
   `document.modelContext.getTools()` without a reload, executes through the registry, and
   disappears after `wp.data.dispatch( 'core/abilities' ).unregisterAbility()`.
2. Register a mutating ability with `meta.public: true` only and confirm it stays absent. Add
   `meta.webmcp.public: true` by unregistering and re-registering the ability, and confirm it
   appears. Re-register an allowlisted ability with `meta.webmcp.public: false` and confirm it
   disappears. Mutating a definition object in place does not notify the abilities store.
3. Temporarily fail the REST discovery request. Confirm the registry tools remain usable. Restore
   the request and register the demo ability again to trigger a store change. Confirm the REST
   tools appear with their server descriptors.
4. Exercise an opted-in server ability with `readonly: false`, `destructive: true`, and
   `idempotent: true` against disposable test data. Confirm the Network panel shows DELETE with
   input in the query. Test both Simple and Atomic sites.
