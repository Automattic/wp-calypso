import { __ } from '@wordpress/i18n';

export const MCP_SERVER_NAME = 'wpcom-mcp';
export const MCP_SERVER_URL = 'https://public-api.wordpress.com/wpcom/v2/mcp/v1';
export const CLAUDE_CODE_COMMAND = `claude mcp add --transport http ${ MCP_SERVER_NAME } ${ MCP_SERVER_URL }`;

// The WordPress listings in each client's directory.
export const CLAUDE_CONNECTOR_URL = 'https://wp.me/claude';
export const CHATGPT_PLUGIN_URL = 'https://wp.me/chatgpt';
export const CURSOR_PLUGIN_URL = 'https://cursor.com/marketplace/wordpress';

// Opens VS Code's own install prompt, so there is no shell command to quote.
// The link format from the VS Code docs. vscode.dev hands the config to the installed app.
export const VSCODE_INSTALL_URL = `https://vscode.dev/redirect?url=${ encodeURIComponent(
	`vscode:mcp/install?${ encodeURIComponent(
		JSON.stringify( { name: MCP_SERVER_NAME, type: 'http', url: MCP_SERVER_URL } )
	) }`
) }`;

const LOGO_BASE_URL = 'https://s2.wp.com/wp-content/themes/a8c/jetpack-2026/assets/home/agents/';

interface ConnectAgentBase {
	key: string;
	name: string;
	description: string;
	logo: string;
	actionLabel: string;
}

export type ConnectAgent = ConnectAgentBase &
	( { href: string; code?: never } | { code: string; href?: never } );

export const HELPER_PROMPT = `Connect yourself to my WordPress.com account over MCP. The server is ${ MCP_SERVER_URL }. Tell me what to click or run for this app, wait while I sign in and approve the connection, then list my sites to confirm it works.`;

export function getConnectAgents(): ConnectAgent[] {
	return [
		{
			key: 'chatgpt',
			name: 'ChatGPT',
			description: __( 'OpenAI’s chat app' ),
			logo: LOGO_BASE_URL + 'chatgpt.svg',
			actionLabel: __( 'Add plugin' ),
			href: CHATGPT_PLUGIN_URL,
		},
		{
			key: 'claude',
			name: 'Claude',
			description: __( 'App and desktop' ),
			logo: LOGO_BASE_URL + 'claude.svg',
			actionLabel: __( 'Add connector' ),
			href: CLAUDE_CONNECTOR_URL,
		},
		{
			key: 'claude-code',
			name: 'Claude Code',
			description: __( 'Anthropic’s coding agent' ),
			logo: LOGO_BASE_URL + 'claude-code.svg',
			actionLabel: __( 'Copy command' ),
			code: CLAUDE_CODE_COMMAND,
		},
		{
			key: 'cursor',
			name: 'Cursor',
			description: __( 'AI code editor' ),
			logo: LOGO_BASE_URL + 'cursor.svg',
			actionLabel: __( 'Add plugin' ),
			href: CURSOR_PLUGIN_URL,
		},
		{
			key: 'vscode',
			name: 'VS Code',
			description: __( 'With GitHub Copilot' ),
			logo: LOGO_BASE_URL + 'vscode.svg',
			actionLabel: __( 'Add server' ),
			href: VSCODE_INSTALL_URL,
		},
		{
			key: 'codex',
			name: 'Codex',
			description: __( 'OpenAI’s coding agent' ),
			logo: LOGO_BASE_URL + 'openai.svg',
			actionLabel: __( 'Copy command' ),
			code: `codex mcp add ${ MCP_SERVER_NAME } --url ${ MCP_SERVER_URL }`,
		},
		{
			key: 'antigravity',
			name: 'Antigravity',
			description: __( 'Google’s coding agent' ),
			logo: LOGO_BASE_URL + 'antigravity.svg',
			actionLabel: __( 'Copy prompt' ),
			code: HELPER_PROMPT,
		},
		{
			key: 'mcp',
			name: __( 'Any MCP agent' ),
			description: __( 'Any app that supports MCP' ),
			logo: LOGO_BASE_URL + 'mcp.svg',
			actionLabel: __( 'Copy URL' ),
			code: MCP_SERVER_URL,
		},
	];
}
