/** @jest-environment jsdom */
import { isAutomatticianQuery, queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { MCP_SERVER_NAME, MCP_SERVER_URL, HELPER_PROMPT } from '../connect-agents';
import McpConnectCard from '../connect-card';

let writeText: jest.Mock;

beforeEach( () => {
	queryClient.clear();
	queryClient.setQueryData( isAutomatticianQuery().queryKey, false );
	writeText = jest.fn().mockResolvedValue( undefined );
	Object.defineProperty( navigator, 'clipboard', { value: { writeText }, configurable: true } );
} );

function renderCard( props: Partial< Parameters< typeof McpConnectCard >[ 0 ] > = {} ) {
	return render(
		<McpConnectCard mcpEnabled onTurnOn={ jest.fn() } isTurningOn={ false } { ...props } />,
		{ queryClient }
	);
}

describe( '<McpConnectCard />', () => {
	test( 'links the chat apps to their WordPress.com listings in a new tab', () => {
		renderCard();

		const claude = screen.getByRole( 'link', { name: 'Claude' } );
		expect( claude ).toHaveAttribute( 'href', 'https://wp.me/claude' );
		expect( claude ).toHaveAttribute( 'target', '_blank' );
		expect( screen.getByRole( 'link', { name: 'ChatGPT' } ) ).toHaveAttribute(
			'href',
			'https://wp.me/chatgpt'
		);
	} );

	test( 'names each tile by its agent and describes it by the rest', () => {
		renderCard();

		expect( screen.getByRole( 'button', { name: 'Claude Code' } ) ).toHaveAccessibleDescription(
			'Anthropic’s coding agent Copy command'
		);
	} );

	test( 'opens VS Code’s install page with the server config', () => {
		renderCard();

		const url = new URL( screen.getByRole( 'link', { name: 'VS Code' } ).getAttribute( 'href' )! );

		expect( url.origin + url.pathname ).toBe( 'https://vscode.dev/redirect/mcp/install' );
		expect( url.searchParams.get( 'name' ) ).toBe( MCP_SERVER_NAME );
		expect( JSON.parse( url.searchParams.get( 'config' )! ) ).toEqual( {
			type: 'http',
			url: MCP_SERVER_URL,
		} );
	} );

	test( 'copies the Claude Code command and confirms it', async () => {
		const { recordTracksEvent } = renderCard();

		const tile = screen.getByRole( 'button', { name: 'Claude Code' } );
		await userEvent.click( tile );

		expect( writeText ).toHaveBeenCalledWith(
			`claude mcp add --transport http ${ MCP_SERVER_NAME } ${ MCP_SERVER_URL }`
		);
		await waitFor( () => expect( tile ).toHaveAccessibleDescription( /Copied$/ ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_mcp_connect_click',
			expect.objectContaining( { agent: 'claude-code', action: 'copy' } )
		);
	} );

	test( 'copies the prompt that lets an agent connect itself', async () => {
		renderCard();

		await userEvent.click( screen.getByRole( 'button', { name: 'Copy prompt' } ) );

		expect( writeText ).toHaveBeenCalledWith( HELPER_PROMPT );
	} );

	test( 'links Manual setup to the setup page while access is on', () => {
		renderCard();

		expect( screen.getByRole( 'link', { name: 'Manual setup' } ) ).toHaveAttribute(
			'href',
			'/me/preferences/mcp/setup'
		);
	} );

	test( 'offers to turn MCP access on while it is off', async () => {
		const onTurnOn = jest.fn();
		renderCard( { mcpEnabled: false, onTurnOn } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Turn on MCP access' } ) );

		expect( onTurnOn ).toHaveBeenCalled();
		expect( screen.queryByRole( 'link', { name: 'Manual setup' } ) ).not.toBeInTheDocument();
	} );

	test( 'hides the MCP-off notice while access is on', () => {
		renderCard();

		expect( screen.queryByText( 'MCP access is off' ) ).not.toBeInTheDocument();
	} );
} );
