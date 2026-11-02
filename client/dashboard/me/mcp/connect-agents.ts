import { __ } from '@wordpress/i18n';

export const MCP_SERVER_URL = 'https://public-api.wordpress.com/wpcom/v2/mcp/v1';

const LOGO_BASE_URL = 'https://s2.wp.com/wp-content/themes/a8c/jetpack-2026/assets/home/agents/';

export interface ConnectAgent {
	key: string;
	name: string;
	description: string;
	logo: string;
	actionLabel: string;
	href?: string;
	code?: string;
}

export function getHelperPrompt() {
	return `Connect yourself to my WordPress.com account over MCP. The server is ${ MCP_SERVER_URL }. Tell me what to click or run for this app, wait while I sign in and approve the connection, then list my sites to confirm it works.`;
}

export function getConnectAgents(): ConnectAgent[] {
	return [
		{
			key: 'chatgpt',
			name: 'ChatGPT',
			description: __( 'OpenAI’s chat app' ),
			logo: LOGO_BASE_URL + 'chatgpt.svg',
			actionLabel: __( 'Add app' ),
			href: 'https://wp.me/chatgpt',
		},
		{
			key: 'claude',
			name: 'Claude',
			description: __( 'App and desktop' ),
			logo: LOGO_BASE_URL + 'claude.svg',
			actionLabel: __( 'Add app' ),
			href: 'https://wp.me/claude',
		},
		{
			key: 'claude-code',
			name: 'Claude Code',
			description: __( 'Anthropic’s coding agent' ),
			logo: LOGO_BASE_URL + 'claude-code.svg',
			actionLabel: __( 'Copy command' ),
			code: `claude mcp add --transport http wpcom-mcp ${ MCP_SERVER_URL }`,
		},
		{
			key: 'cursor',
			name: 'Cursor',
			description: __( 'AI code editor' ),
			logo: LOGO_BASE_URL + 'cursor.svg',
			actionLabel: __( 'Copy command' ),
			code: '/add-plugin wordpress-com',
		},
		{
			key: 'vscode',
			name: 'VS Code',
			description: __( 'With GitHub Copilot' ),
			logo: LOGO_BASE_URL + 'vscode.svg',
			actionLabel: __( 'Copy command' ),
			code: `code --add-mcp '${ JSON.stringify( {
				name: 'wpcom-mcp',
				type: 'http',
				url: MCP_SERVER_URL,
			} ) }'`,
		},
		{
			key: 'codex',
			name: 'Codex',
			description: __( 'OpenAI’s coding agent' ),
			logo: LOGO_BASE_URL + 'openai.svg',
			actionLabel: __( 'Copy command' ),
			code: `codex mcp add wpcom-mcp --url ${ MCP_SERVER_URL }`,
		},
		{
			key: 'antigravity',
			name: 'Antigravity',
			description: __( 'Google’s coding agent' ),
			logo: LOGO_BASE_URL + 'antigravity.svg',
			actionLabel: __( 'Copy prompt' ),
			code: 'Install the WordPress plugin and show me how to connect my site.',
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
