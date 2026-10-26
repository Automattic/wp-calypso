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
