# Agent components MCP App

The MCP Apps adapter renders action surfaces from `@automattic/agent-components`. It receives an authenticated component opening through the host, calls `wpcom-component-action`, and sends the confirmed result summary back to the same conversation. A refused continuation preserves the completed result and displays feedback.

```bash
yarn workspace @automattic/agent-components-mcp build
yarn workspace @automattic/agent-components-mcp test
yarn workspace @automattic/agent-components-mcp type-check
```

Deploy `dist/manifest.json` and its checksum-named HTML file to `wp-content/lib/ai/tools/components/mcp-app/` alongside the MCP V1 server integration. The HTML embeds React, the shared components, the official MCP Apps SDK and CSS. The manifest provides the resource URI, checksum, size and CSP domains.

The app applies host theme, style, locale, direction and container constraints. Shell messages use English; field labels, button labels and result text come from the server. After deploying a new resource, refresh the host's MCP tool inventory because open cards can retain the old template.

For live acceptance, propose an action in an MCP conversation, click its confirmation, and verify the saved-site mutation, completed replacement and agent's next reply. A successful `sendMessage` response alone does not prove that the agent replied. An uncertain result disables the control; history reopening must not restore completed actions.
