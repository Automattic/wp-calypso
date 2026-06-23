import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import type { ReactNode } from 'react';

export const A4A_MCP_URL = 'https://public-api.wordpress.com/wpcom/v2/agencies-mcp/v1';

// `@automattic/mcp-remote` is our published fork of `mcp-remote` that preserves the
// WWW-Authenticate `resource_metadata` URL across OAuth transport instances, which
// upstream loses. Without this fix, OAuth to wpcom-hosted MCP servers fails with
// "Protected resource ... does not match expected ...". See:
// https://github.com/automattic/mcp-remote
const MCP_REMOTE_PACKAGE = '@automattic/mcp-remote';

const MCP_SERVER_NAME = 'automattic-agencies-mcp';

export interface FallbackSetup {
	description: string;
	file?: string;
	language: 'json' | 'toml';
	snippet: string;
}

export interface AgentConfig {
	id: string;
	label: string;
	quickSetupDescription?: string;
	quickSetup?: ReactNode[];
	installAction?: {
		label: string;
		deepLink: string;
	};
	manualSetupFile?: string;
	manualSetupLanguage?: 'json' | 'toml';
	manualSetupSnippet?: string;
	fallbackSetup?: FallbackSetup;
	docsUrl: string;
	docsLabel: string;
}

// One-click install deep links point at the native remote server URL — no local
// Node bridge. Cursor expects a base64-encoded server object; VS Code expects a
// URL-encoded server object that includes the server name.
const cursorInstallDeepLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${ MCP_SERVER_NAME }&config=${ encodeURIComponent(
	btoa( JSON.stringify( { url: A4A_MCP_URL } ) )
) }`;

const vscodeInstallDeepLink = `vscode:mcp/install?${ encodeURIComponent(
	JSON.stringify( { name: MCP_SERVER_NAME, type: 'http', url: A4A_MCP_URL } )
) }`;

// Native, Node-free remote configurations (URL + browser OAuth).
const claudeCodeNativeSnippet = JSON.stringify(
	{ mcpServers: { [ MCP_SERVER_NAME ]: { type: 'http', url: A4A_MCP_URL } } },
	null,
	2
);

const urlServerSnippet = JSON.stringify(
	{ mcpServers: { [ MCP_SERVER_NAME ]: { url: A4A_MCP_URL } } },
	null,
	2
);

const vscodeNativeSnippet = JSON.stringify(
	{ servers: { [ MCP_SERVER_NAME ]: { type: 'http', url: A4A_MCP_URL } } },
	null,
	2
);

const codexNativeSnippet = [
	`[mcp_servers.${ MCP_SERVER_NAME }]`,
	`url = "${ A4A_MCP_URL }"`,
	`oauth_resource = "${ A4A_MCP_URL }"`,
].join( '\n' );

// Legacy fallback: route the connection through the `@automattic/mcp-remote`
// stdio bridge (requires Node). Only for older clients or when native OAuth fails.
const bridgeArgs = [ '-y', MCP_REMOTE_PACKAGE, A4A_MCP_URL ];

const mcpServersBridgeSnippet = JSON.stringify(
	{ mcpServers: { [ MCP_SERVER_NAME ]: { command: 'npx', args: bridgeArgs } } },
	null,
	2
);

const serversBridgeSnippet = JSON.stringify(
	{ servers: { [ MCP_SERVER_NAME ]: { command: 'npx', args: bridgeArgs } } },
	null,
	2
);

const fallbackDescription = ( clientNote: string ) =>
	sprintf(
		/* translators: %s: short note about when to use the fallback, e.g. "older Cursor versions" */
		__(
			'Use this only for %s, or if the native connection fails. It routes the connection through a local Node bridge and requires Node 20 or later.'
		),
		clientNote
	);

export const AGENT_CONFIGS: AgentConfig[] = [
	{
		id: 'claude-desktop',
		label: 'Claude Desktop',
		quickSetupDescription: __(
			'Connect Claude Desktop with no config files — just paste the server URL.'
		),
		quickSetup: [
			__( 'In Claude Desktop, open Settings → Connectors.' ),
			__( 'Scroll to the bottom and click “Add custom connector”.' ),
			createInterpolateElement(
				sprintf(
					/* translators: %s: MCP server URL, kept inside <code> */
					__( 'Paste this server URL and click “Add”: <code>%s</code>' ),
					A4A_MCP_URL
				),
				{ code: <code /> }
			),
			__(
				'Click “Connect” and sign in with your Automattic for Agencies account in the browser window that opens.'
			),
		],
		fallbackSetup: {
			description: fallbackDescription( __( 'older Claude Desktop versions without Connectors' ) ),
			file: 'claude_desktop_config.json',
			language: 'json',
			snippet: mcpServersBridgeSnippet,
		},
		docsUrl: 'https://modelcontextprotocol.io/docs/develop/connect-remote-servers',
		docsLabel: __( 'Claude Desktop documentation' ),
	},
	{
		id: 'claude-code',
		label: 'Claude Code',
		quickSetupDescription: __(
			'Claude Code connects directly over HTTP — no Node bridge required.'
		),
		quickSetup: [
			createInterpolateElement(
				sprintf(
					/* translators: %1$s: MCP server name, kept inside <code>; %2$s: MCP server URL, kept inside <code> */
					__( 'Run in your terminal: <code>claude mcp add --transport http %1$s %2$s</code>' ),
					MCP_SERVER_NAME,
					A4A_MCP_URL
				),
				{ code: <code /> }
			),
			createInterpolateElement(
				sprintf(
					/* translators: %s: MCP server name, kept inside <code> */
					__(
						'Run <code>claude</code>, select <code>/mcp</code>, then select <code>%s</code> and authenticate. Your browser opens to complete sign-in.'
					),
					MCP_SERVER_NAME
				),
				{ code: <code /> }
			),
			createInterpolateElement(
				__(
					'Prefer to edit config? Add the block below to your project’s <code>.mcp.json</code> or your global <code>~/.claude.json</code>.'
				),
				{ code: <code /> }
			),
		],
		manualSetupFile: '~/.claude.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: claudeCodeNativeSnippet,
		docsUrl: 'https://code.claude.com/docs/en/mcp',
		docsLabel: __( 'Claude Code documentation' ),
	},
	{
		id: 'cursor',
		label: 'Cursor',
		quickSetupDescription: __( 'Install with one click, then sign in when your browser opens.' ),
		installAction: {
			label: __( 'Install in Cursor' ),
			deepLink: cursorInstallDeepLink,
		},
		manualSetupFile: '~/.cursor/mcp.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: urlServerSnippet,
		fallbackSetup: {
			description: fallbackDescription( __( 'older Cursor versions without remote MCP support' ) ),
			file: '~/.cursor/mcp.json',
			language: 'json',
			snippet: mcpServersBridgeSnippet,
		},
		docsUrl: 'https://cursor.com/docs/mcp',
		docsLabel: __( 'Cursor documentation' ),
	},
	{
		id: 'vscode',
		label: 'VS Code',
		quickSetupDescription: __( 'Install with one click, then sign in when your browser opens.' ),
		installAction: {
			label: __( 'Install in VS Code' ),
			deepLink: vscodeInstallDeepLink,
		},
		manualSetupFile: '~/Library/Application Support/Code/User/mcp.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: vscodeNativeSnippet,
		fallbackSetup: {
			description: fallbackDescription( __( 'older VS Code versions without remote MCP support' ) ),
			file: '~/Library/Application Support/Code/User/mcp.json',
			language: 'json',
			snippet: serversBridgeSnippet,
		},
		docsUrl: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		docsLabel: __( 'VS Code MCP documentation' ),
	},
	{
		id: 'codex',
		label: 'Codex',
		quickSetupDescription: __( 'Codex connects directly over HTTP — no Node bridge required.' ),
		quickSetup: [
			createInterpolateElement(
				sprintf(
					/* translators: %1$s: MCP server name, kept inside <code>; %2$s: MCP server URL, kept inside <code> */
					__( 'Add the server: <code>codex mcp add %1$s --url %2$s</code>' ),
					MCP_SERVER_NAME,
					A4A_MCP_URL
				),
				{ code: <code /> }
			),
			createInterpolateElement(
				sprintf(
					/* translators: %s: MCP server name, kept inside <code> */
					__(
						'Authenticate: <code>codex mcp login %s</code>. Your browser opens to complete sign-in.'
					),
					MCP_SERVER_NAME
				),
				{ code: <code /> }
			),
			createInterpolateElement(
				__(
					'Prefer to edit config? Append the block below to <code>~/.codex/config.toml</code>, restart Codex, then go to Codex → MCP servers → Authenticate.'
				),
				{ code: <code /> }
			),
		],
		manualSetupFile: '~/.codex/config.toml',
		manualSetupLanguage: 'toml',
		manualSetupSnippet: codexNativeSnippet,
		docsUrl: 'https://github.com/openai/codex',
		docsLabel: __( 'Codex documentation' ),
	},
	{
		id: 'other',
		label: __( 'Other MCP client' ),
		quickSetupDescription: __(
			'Most MCP clients connect to a remote server with just its URL and a browser sign-in.'
		),
		manualSetupLanguage: 'json',
		manualSetupSnippet: urlServerSnippet,
		fallbackSetup: {
			description: fallbackDescription( __( 'clients that don’t support remote MCP servers' ) ),
			language: 'json',
			snippet: mcpServersBridgeSnippet,
		},
		docsUrl: 'https://modelcontextprotocol.io/docs/develop/connect-remote-servers',
		docsLabel: __( 'MCP documentation' ),
	},
];

export const DEFAULT_AGENT_ID = 'claude-desktop';
