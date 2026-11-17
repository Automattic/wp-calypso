/** @vitest-environment jsdom */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import { MCP_SERVER_NAME, MCP_SERVER_URL } from '../../connect-agents';
import McpSetupInstructions from '../instructions';

async function chooseAgent( label: string ) {
	await userEvent.selectOptions( screen.getByRole( 'combobox', { name: 'AI agent' } ), label );
}

describe( '<McpSetupInstructions />', () => {
	test( 'links Claude straight to the WordPress.com connector', () => {
		render( <McpSetupInstructions /> );

		expect( screen.getByRole( 'link', { name: /WordPress.com connector/ } ) ).toHaveAttribute(
			'href',
			'https://wp.me/claude'
		);
		expect( screen.getByText( 'Click “Connect” and follow the prompts.' ) ).toBeVisible();
	} );

	test( 'links ChatGPT straight to the WordPress plugin, with no config to copy', async () => {
		render( <McpSetupInstructions /> );

		await chooseAgent( 'ChatGPT/Codex' );

		expect( screen.getByRole( 'link', { name: /WordPress plugin/ } ) ).toHaveAttribute(
			'href',
			'https://wp.me/chatgpt'
		);
		expect(
			screen.queryByRole( 'textbox', { name: 'MCP configuration' } )
		).not.toBeInTheDocument();
	} );

	test( 'links Cursor to the WordPress plugin and gives the chat command', async () => {
		render( <McpSetupInstructions /> );

		await chooseAgent( 'Cursor' );

		expect( screen.getByRole( 'link', { name: /WordPress plugin/ } ) ).toHaveAttribute(
			'href',
			'https://cursor.com/marketplace/wordpress'
		);
		expect( screen.getByText( '/add-plugin wordpress-com' ) ).toBeVisible();
	} );

	test( 'shows the VS Code config under its own key', async () => {
		render( <McpSetupInstructions /> );

		await chooseAgent( 'VS Code' );

		expect(
			JSON.parse(
				( screen.getByRole( 'textbox', { name: 'MCP configuration' } ) as HTMLTextAreaElement )
					.value
			)
		).toEqual( { servers: { [ MCP_SERVER_NAME ]: { url: MCP_SERVER_URL } } } );
		expect( screen.getByRole( 'link', { name: /VS Code documentation/ } ) ).toHaveAttribute(
			'href',
			'https://code.visualstudio.com/docs/agent-customization/mcp-servers'
		);
	} );

	test( 'copies the config', async () => {
		const writeText = vi.fn().mockResolvedValue( undefined );
		Object.defineProperty( navigator, 'clipboard', { value: { writeText }, configurable: true } );
		render( <McpSetupInstructions /> );

		await userEvent.click(
			screen.getByRole( 'button', { name: 'Copy configuration to clipboard' } )
		);

		expect( JSON.parse( writeText.mock.calls[ 0 ][ 0 ] ) ).toEqual( {
			mcpServers: { [ MCP_SERVER_NAME ]: { url: MCP_SERVER_URL } },
		} );
	} );
} );
