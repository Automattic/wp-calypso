# Experimental WebMCP editor tools

Agents Manager can expose a small set of editor abilities to browser agents through the draft
WebMCP API. The browser agent supplies the model and all reasoning. This adapter does not create an
Agenttic agent, open Agents Manager chat, or call the WordPress.com AI orchestrator.

This is a staff-testing proof of concept, not a production-supported integration. It is disabled by
default. Enable it on a supported post, page, or site editor URL with `?webmcp=1` in a browser that
implements `document.modelContext.registerTool` (or the older `navigator.modelContext` location).

## Execution and exposure

The adapter uses the live merged `ToolProvider` returned by `loadExternalProviders()`. That provider
combines Agents Manager-owned abilities with external fallback providers, resolves duplicate names
using the established precedence, and applies the existing canvas guard. WebMCP calls execute with
the original slash-based ability name through `toolProvider.executeAbility()`. While the experiment
is eligible, the external provider's ability-setup hook also mounts at the stable Agents Manager
lifecycle so hook-dependent abilities can register without opening the chat route.

The initial allowlist contains only:

- `big-sky/apply-block-edits`: a client-registered ability that deterministically changes the
  current block-editor canvas. It does not save or publish the edit, so the result remains visible
  and reviewable. On current trunk it is owned by the Big Sky fallback provider; the merged-provider
  seam continues to work when ownership migrates to Agents Manager.

An allowlisted ability is still rejected if it is marked server-registered. It must be marked
client-registered or carry a client callback, which supports both registry-returned provider
abilities and direct Agents Manager-owned definitions.

## Testing

1. Open a post, page, or site editor with `?webmcp=1` and the browser's WebMCP testing feature on.
2. Without opening Agents Manager chat, ask the browser agent to enumerate the page's tools.
3. Confirm `big_sky__apply_block_edits` is the only tool from this adapter.
4. Apply a small reversible edit and confirm the canvas changes without being saved or published.
5. Confirm the Network panel shows no Agenttic/orchestrator/model request.
6. Navigate to another editor/site and confirm the tool now targets only the current canvas.
7. Remove `webmcp=1` and reload; confirm the tool is absent.
8. Use `?webmcp=1&am_abilities=0` to exercise the external-provider ownership path during migration.

The adapter reconciles the provider every two seconds only while the experiment is eligible. This
covers abilities registered by later React effects. Changing scope or unmounting Agents Manager
aborts all registrations. An already-aborted tool execution is rejected, but an in-flight provider
execution cannot currently be cancelled because `ToolProvider.executeAbility()` has no signal.

To add another tool, verify its complete implementation and execution path are client-only,
editor-scoped, deterministic, reviewable, non-administrative, and free of model/orchestrator calls.
Then add its original ability name to `WEBMCP_EDITOR_ABILITY_ALLOWLIST` with a concise safety
rationale and tests proving server lookalikes remain excluded.
