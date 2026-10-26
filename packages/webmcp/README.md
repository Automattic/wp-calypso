# WebMCP

`@automattic/webmcp` registers browser tools alongside tools already supplied by WordPress or other
scripts. It uses `document.modelContext`, with a fallback to the older `navigator.modelContext`.
It does not install a browser API or replace the page's registry.

```ts
import { createWebMcpToolRegistry, getWebMcpModelContext } from '@automattic/webmcp';

const modelContext = getWebMcpModelContext();
if ( modelContext ) {
	const registry = createWebMcpToolRegistry( {
		modelContext,
		getTools: () => toolsForCurrentPage,
	} );
	registry.sync().catch( reportError );
	// Call sync after the available tools change, and dispose when their owner unmounts.
}
```

Each registry owns only the tools it successfully registers. Synchronization keeps unchanged
registrations, updates changed descriptors, and aborts registrations that leave the supplied list.
Disposal aborts pending and active registrations. Saved callbacks reject after their registration
ends. An action already running may still complete unless it supports cancellation itself.

Tool names must be distinct from other providers. A rejected registration does not stop the other
tools from registering; `sync()` rejects afterward so the caller can report the failure. Callers
must catch that rejection and keep the normal UI independent of WebMCP.

Tool descriptors use the browser's WebMCP shape and preserve annotations unchanged. The package has
no dependency on Agents Manager, the WordPress abilities registry, or the experimental `wpai.webmcp`
API. Those integrations supply their own tools and execution callbacks.

## Playground onboarding

Open `/setup/onboarding/playground/?webmcp=1` in a WebMCP-capable browser. The opt-in loads
Playground's existing tools and its WordPress tool proxy, plus `wpcom_launch_site`. This tool uses
the same action as the page's launch button: it continues to signup and preserves the Playground
site. No other Dotcom tools are included.

`@automattic/webmcp/playground` connects a Playground client with a caller-owned abort signal.
Aborting it removes the Playground registrations and stops the WordPress proxy. The local patch
to `@wp-playground/mcp` adds this signal option and fixes its client declaration export. The
Playground type packages and logger are explicit dependencies because its published client does
not declare them. Renaming a Playground during onboarding returns an unsupported-operation error.

For a manual check, run local Calypso and open the route above in the built-in browser. Discover
the page's Site tools, call `playground_get_site_info`, then call `wpcom_launch_site`. Signup should
open and the Playground tools should disappear. Repeat without `webmcp=1`: the regular launch
button should work and this integration should register no tools.

To check upstream compatibility, install the preview from
[WordPress/ai#1081](https://github.com/WordPress/ai/pull/1081) in the disposable Playground, enable
its WebMCP experiment, and open a post editor. Its `editor-*` tools should appear alongside the
Playground and Dotcom tools. Set a draft title or insert a paragraph, verify the visible change,
then undo it. This plugin is only needed for the compatibility check.
