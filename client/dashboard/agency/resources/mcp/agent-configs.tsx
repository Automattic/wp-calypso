import { ExternalLink } from '@wordpress/components';
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
	steps?: ReactNode[];
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
	manualSetupSnippet?: string;
	fallbackSetup?: FallbackSetup;
	docsUrl: string;
	docsLabel: string;
}

// The `@automattic/mcp-remote` stdio bridge (requires Node), used by clients that
// don't support a native remote HTTP connection yet.
const bridgeArgs = [ '-y', MCP_REMOTE_PACKAGE, A4A_MCP_URL ];

// One-click install deep links. Cursor and VS Code don't support native remote
// HTTP yet, so their deep links install the `@automattic/mcp-remote` bridge.
// Cursor expects a base64-encoded server object; VS Code a URL-encoded one.
const cursorInstallDeepLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${ MCP_SERVER_NAME }&config=${ encodeURIComponent(
	btoa( JSON.stringify( { command: `npx -y ${ MCP_REMOTE_PACKAGE } ${ A4A_MCP_URL }` } ) )
) }`;

const vscodeInstallDeepLink = `vscode:mcp/install?${ encodeURIComponent(
	JSON.stringify( { name: MCP_SERVER_NAME, command: 'npx', args: bridgeArgs } )
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

const codexNativeSnippet = [
	`[mcp_servers.${ MCP_SERVER_NAME }]`,
	`url = "${ A4A_MCP_URL }"`,
	`oauth_resource = "${ A4A_MCP_URL }"`,
].join( '\n' );

// Bridge configurations for the manual setup guide.
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

// Shared first step for the Node bridge guides.
const installNodeStep = createInterpolateElement(
	sprintf(
		/* translators: %s: npm package name, kept inside <code> */
		__( 'Install Node 20 or later (required by <code>%s</code>).' ),
		MCP_REMOTE_PACKAGE
	),
	{ code: <code /> }
);

const fallbackDescription = ( clientNote: string ) =>
	sprintf(
		/* translators: %s: short note about when to use the fallback, e.g. "older Cursor versions" */
		__(
			'Use this only for %s, or if the native connection fails. It routes the connection through a local Node bridge and requires Node 20 or later.'
		),
		clientNote
	);

// Node bridge setup steps. Cursor and VS Code connect only through the bridge, so
// these are their primary guide; Claude Desktop uses them as a fallback.
const claudeDesktopBridgeSteps: ReactNode[] = [
	installNodeStep,
	__(
		'Open Claude Desktop → Settings → Developer, then click “Edit Config” under Local MCP servers.'
	),
	createInterpolateElement(
		__(
			'Add the configuration below to <code>claude_desktop_config.json</code> (typically at <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>).'
		),
		{ code: <code /> }
	),
	__( 'Restart Claude Desktop.' ),
	__(
		'If you haven’t authenticated yet, Claude Desktop will prompt you in your browser as soon as it reopens.'
	),
];

const cursorBridgeSteps: ReactNode[] = [
	installNodeStep,
	createInterpolateElement( __( 'Open <code>~/.cursor/mcp.json</code>.' ), { code: <code /> } ),
	createInterpolateElement( __( 'Add the block below under <code>mcpServers</code>.' ), {
		code: <code />,
	} ),
	__( 'Fully quit Cursor (Cmd+Q) and relaunch.' ),
	__(
		'If you haven’t authenticated yet, Cursor will prompt you in your browser as soon as it reopens.'
	),
];

const vscodeBridgeSteps: ReactNode[] = [
	installNodeStep,
	createInterpolateElement(
		__( 'Open <code>~/Library/Application Support/Code/User/mcp.json</code> (create if missing).' ),
		{ code: <code /> }
	),
	createInterpolateElement( __( 'Add the block below under <code>servers</code>.' ), {
		code: <code />,
	} ),
	__( 'Restart VS Code.' ),
	__(
		'If you haven’t authenticated yet, VS Code will prompt you in your browser as soon as it reopens.'
	),
];

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
			steps: claudeDesktopBridgeSteps,
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
				__(
					'Install Claude Code: run <code>npm install -g @anthropic-ai/claude-code</code> or see <a>the setup guide</a>.'
				),
				{
					code: <code />,
					a: (
						<ExternalLink
							href="https://docs.anthropic.com/en/docs/claude-code/setup"
							children={ __( 'the setup guide' ) }
						/>
					),
				}
			),
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
		manualSetupSnippet: claudeCodeNativeSnippet,
		docsUrl: 'https://code.claude.com/docs/en/mcp',
		docsLabel: __( 'Claude Code documentation' ),
	},
	{
		id: 'cursor',
		label: 'Cursor',
		quickSetup: cursorBridgeSteps,
		installAction: {
			label: __( 'Install in Cursor' ),
			deepLink: cursorInstallDeepLink,
		},
		manualSetupFile: '~/.cursor/mcp.json',
		manualSetupSnippet: mcpServersBridgeSnippet,
		docsUrl: 'https://cursor.com/docs/mcp',
		docsLabel: __( 'Cursor documentation' ),
	},
	{
		id: 'vscode',
		label: 'VS Code',
		quickSetup: vscodeBridgeSteps,
		installAction: {
			label: __( 'Install in VS Code' ),
			deepLink: vscodeInstallDeepLink,
		},
		manualSetupFile: '~/Library/Application Support/Code/User/mcp.json',
		manualSetupSnippet: serversBridgeSnippet,
		docsUrl: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		docsLabel: __( 'VS Code MCP documentation' ),
	},
	{
		id: 'codex',
		label: 'Codex',
		quickSetup: [
			createInterpolateElement( __( 'Open <code>~/.codex/config.toml</code> in your editor.' ), {
				code: <code />,
			} ),
			__( 'Append the block below to the file.' ),
			__( 'Restart Codex.' ),
			__( 'Go to Codex → MCP servers → Authenticate.' ),
		],
		manualSetupFile: '~/.codex/config.toml',
		manualSetupSnippet: codexNativeSnippet,
		docsUrl: 'https://github.com/openai/codex',
		docsLabel: __( 'Codex documentation' ),
	},
	{
		id: 'other',
		label: __( 'Other MCP client' ),
		manualSetupSnippet: urlServerSnippet,
		fallbackSetup: {
			description: fallbackDescription( __( 'clients that don’t support remote MCP servers' ) ),
			snippet: mcpServersBridgeSnippet,
		},
		docsUrl: 'https://modelcontextprotocol.io/docs/develop/connect-remote-servers',
		docsLabel: __( 'MCP documentation' ),
	},
];

export const DEFAULT_AGENT_ID = 'claude-desktop';
