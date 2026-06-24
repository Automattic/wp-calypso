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
	manualSetupLanguage: 'json' | 'toml';
	manualSetupSnippet: string;
	docsUrl: string;
	docsLabel: string;
}

const cursorInstallDeepLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${ MCP_SERVER_NAME }&config=${ encodeURIComponent(
	btoa( JSON.stringify( { command: `npx -y ${ MCP_REMOTE_PACKAGE } ${ A4A_MCP_URL }` } ) )
) }`;

// Shared quick-setup step for clients that shell out to `@automattic/mcp-remote` via npx
// (Claude Desktop Developer config, Cursor, VS Code).
const installNodeStep = createInterpolateElement(
	sprintf(
		/* translators: %s: npm package name, kept inside <code> */
		__( 'Install Node 20 or later (required by <code>%s</code>).' ),
		MCP_REMOTE_PACKAGE
	),
	{ code: <code /> }
);

export const AGENT_CONFIGS: AgentConfig[] = [
	{
		id: 'claude-code',
		label: 'Claude Code',
		quickSetupDescription: __(
			'Claude Code uses a different config format with type: “http”. Use the CLI or copy the configuration below.'
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
				__(
					'Or copy the configuration below into your project’s <code>.mcp.json</code> or your global <code>~/.claude.json</code> file.'
				),
				{ code: <code /> }
			),
			createInterpolateElement(
				sprintf(
					/* translators: %s: MCP server name, kept inside <code> */
					__(
						'Run <code>claude</code> in your terminal, select <code>/mcp</code>, then select <code>%s</code> and authenticate. Your browser opens to complete the OAuth flow.'
					),
					MCP_SERVER_NAME
				),
				{ code: <code /> }
			),
		],
		manualSetupFile: '~/.claude.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: JSON.stringify(
			{
				mcpServers: {
					[ MCP_SERVER_NAME ]: {
						type: 'http',
						url: A4A_MCP_URL,
					},
				},
			},
			null,
			2
		),
		docsUrl: 'https://code.claude.com/docs/en/mcp',
		docsLabel: __( 'Claude Code documentation' ),
	},
	{
		id: 'claude-desktop',
		label: 'Claude Desktop',
		quickSetup: [
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
		],
		manualSetupFile: 'claude_desktop_config.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: JSON.stringify(
			{
				mcpServers: {
					[ MCP_SERVER_NAME ]: {
						command: 'npx',
						args: [ '-y', MCP_REMOTE_PACKAGE, A4A_MCP_URL ],
					},
				},
			},
			null,
			2
		),
		docsUrl: 'https://modelcontextprotocol.io/quickstart/user',
		docsLabel: __( 'Claude Desktop documentation' ),
	},
	{
		id: 'cursor',
		label: 'Cursor',
		installAction: {
			label: __( 'Install in Cursor' ),
			deepLink: cursorInstallDeepLink,
		},
		quickSetup: [
			installNodeStep,
			createInterpolateElement( __( 'Open <code>~/.cursor/mcp.json</code> in your editor.' ), {
				code: <code />,
			} ),
			createInterpolateElement( __( 'Add the block below under <code>mcpServers</code>.' ), {
				code: <code />,
			} ),
			__( 'Fully quit Cursor (Cmd+Q) and relaunch.' ),
			__(
				'If you haven’t authenticated yet, Cursor will prompt you in your browser as soon as it reopens.'
			),
		],
		manualSetupFile: '~/.cursor/mcp.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: JSON.stringify(
			{
				mcpServers: {
					[ MCP_SERVER_NAME ]: {
						command: 'npx',
						args: [ '-y', MCP_REMOTE_PACKAGE, A4A_MCP_URL ],
					},
				},
			},
			null,
			2
		),
		docsUrl: 'https://cursor.com/docs/mcp',
		docsLabel: __( 'Cursor documentation' ),
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
		manualSetupLanguage: 'toml',
		manualSetupSnippet: [
			`[mcp_servers.${ MCP_SERVER_NAME }]`,
			`url = "${ A4A_MCP_URL }"`,
			`oauth_resource = "${ A4A_MCP_URL }"`,
		].join( '\n' ),
		docsUrl: 'https://github.com/openai/codex',
		docsLabel: __( 'Codex documentation' ),
	},
	{
		id: 'vscode',
		label: 'VS Code',
		quickSetup: [
			installNodeStep,
			createInterpolateElement(
				__(
					'Open <code>~/Library/Application Support/Code/User/mcp.json</code> (create if missing).'
				),
				{ code: <code /> }
			),
			createInterpolateElement( __( 'Add the block below under <code>servers</code>.' ), {
				code: <code />,
			} ),
			__( 'Restart VS Code.' ),
			__(
				'If you haven’t authenticated yet, VS Code will prompt you in your browser as soon as it reopens.'
			),
		],
		manualSetupFile: '~/Library/Application Support/Code/User/mcp.json',
		manualSetupLanguage: 'json',
		manualSetupSnippet: JSON.stringify(
			{
				servers: {
					[ MCP_SERVER_NAME ]: {
						command: 'npx',
						args: [ '-y', MCP_REMOTE_PACKAGE, A4A_MCP_URL ],
					},
				},
			},
			null,
			2
		),
		docsUrl: 'https://code.visualstudio.com/docs/copilot/customization/mcp-servers',
		docsLabel: __( 'VS Code MCP documentation' ),
	},
	{
		id: 'other',
		label: __( 'Other MCP client' ),
		manualSetupLanguage: 'json',
		manualSetupSnippet: JSON.stringify(
			{
				mcpServers: {
					[ MCP_SERVER_NAME ]: {
						url: A4A_MCP_URL,
					},
				},
			},
			null,
			2
		),
		docsUrl: 'https://modelcontextprotocol.io/docs/develop/connect-local-servers',
		docsLabel: __( 'MCP documentation' ),
	},
];

export const DEFAULT_AGENT_ID = 'claude-code';
