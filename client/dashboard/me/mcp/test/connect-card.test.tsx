/** @jest-environment jsdom */
import { isAutomatticianQuery, queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

	test( 'tells screen readers that a link tile opens a new tab', () => {
		renderCard();

		expect( screen.getByRole( 'link', { name: 'ChatGPT' } ) ).toHaveAccessibleDescription(
			'OpenAI’s chat app Add plugin (opens in a new tab)'
		);
	} );

	test( 'links Cursor to the WordPress.com plugin on its Marketplace', () => {
		renderCard();

		expect( screen.getByRole( 'link', { name: 'Cursor' } ) ).toHaveAttribute(
			'href',
			'https://cursor.com/marketplace/wordpress'
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
		const target = url.searchParams.get( 'url' )!;
		const prefix = 'vscode:mcp/install?';

		expect( url.origin + url.pathname ).toBe( 'https://vscode.dev/redirect' );
		expect( target.startsWith( prefix ) ).toBe( true );
		expect( JSON.parse( decodeURIComponent( target.slice( prefix.length ) ) ) ).toEqual( {
			name: MCP_SERVER_NAME,
			type: 'http',
			url: MCP_SERVER_URL,
		} );
	} );

	test( 'records the open when a link tile is clicked', async () => {
		const { recordTracksEvent } = renderCard();

		await userEvent.click( screen.getByRole( 'link', { name: 'Cursor' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_mcp_connect_click',
			expect.objectContaining( { agent: 'cursor', action: 'open' } )
		);
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

	test( 'records nothing when the copy fails', async () => {
		writeText.mockRejectedValue( new Error( 'Blocked' ) );
		const { recordTracksEvent } = renderCard();

		const tile = screen.getByRole( 'button', { name: 'Claude Code' } );
		await userEvent.click( tile );

		expect( writeText ).toHaveBeenCalled();
		expect( tile ).toHaveAccessibleDescription( /Copy command$/ );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_mcp_connect_click',
			expect.anything()
		);
	} );

	test( 'shows the text, selected, when the copy fails', async () => {
		writeText.mockRejectedValueOnce( new Error( 'Blocked' ) );
		renderCard();

		await userEvent.click( screen.getByRole( 'button', { name: 'Claude Code' } ) );

		const field = await screen.findByRole( 'textbox', { name: 'Your browser blocked copying' } );
		expect( field ).toHaveAccessibleDescription( 'Press Ctrl+C or ⌘C to copy this text.' );
		expect( field ).toHaveValue(
			`claude mcp add --transport http ${ MCP_SERVER_NAME } ${ MCP_SERVER_URL }`
		);
		expect( field ).toHaveFocus();
		expect( ( field as HTMLTextAreaElement ).selectionEnd ).toBe(
			( field as HTMLTextAreaElement ).value.length
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Copy prompt' } ) );

		await waitFor( () => expect( field ).not.toBeInTheDocument() );
	} );

	test( 'selects the text again when the same copy fails twice', async () => {
		writeText.mockRejectedValue( new Error( 'Blocked' ) );
		renderCard();

		const tile = screen.getByRole( 'button', { name: 'Claude Code' } );
		await userEvent.click( tile );
		const field = await screen.findByRole( 'textbox', { name: 'Your browser blocked copying' } );
		await userEvent.click( tile );

		await waitFor( () => expect( field ).toHaveFocus() );
		expect( ( field as HTMLTextAreaElement ).selectionStart ).toBe( 0 );
		expect( ( field as HTMLTextAreaElement ).selectionEnd ).toBe(
			( field as HTMLTextAreaElement ).value.length
		);
	} );

	test( 'copies the prompt that lets an agent connect itself', async () => {
		const { recordTracksEvent } = renderCard();

		await userEvent.click( screen.getByRole( 'button', { name: 'Copy prompt' } ) );

		expect( writeText ).toHaveBeenCalledWith( HELPER_PROMPT );
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_mcp_connect_helper_copy',
				expect.any( Object )
			)
		);
	} );

	test( 'gives Antigravity the same prompt', async () => {
		renderCard();

		await userEvent.click( screen.getByRole( 'button', { name: 'Antigravity' } ) );

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

	test( 'moves focus to the first tile after turning access on', async () => {
		function Harness() {
			const [ enabled, setEnabled ] = useState( false );
			return (
				<McpConnectCard
					mcpEnabled={ enabled }
					onTurnOn={ () => setEnabled( true ) }
					isTurningOn={ false }
				/>
			);
		}
		render( <Harness />, { queryClient } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Turn on MCP access' } ) );

		await waitFor( () => expect( screen.getByRole( 'link', { name: 'ChatGPT' } ) ).toHaveFocus() );
	} );

	test( 'leaves focus alone when access is turned on with the toggle', async () => {
		function Harness() {
			const [ enabled, setEnabled ] = useState( false );
			return (
				<>
					<McpConnectCard mcpEnabled={ enabled } onTurnOn={ jest.fn() } isTurningOn={ false } />
					<button
						type="button"
						onClick={ ( event ) => {
							// The real toggle disables while saving, which drops focus to the body.
							event.currentTarget.blur();
							setEnabled( true );
						} }
					>
						Toggle
					</button>
				</>
			);
		}
		render( <Harness />, { queryClient } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Toggle' } ) );

		await screen.findByRole( 'link', { name: 'Manual setup' } );
		expect( document.body ).toHaveFocus();
	} );

	test( 'hides the MCP-off notice while access is on', () => {
		renderCard();

		expect( screen.queryByText( 'MCP access is off' ) ).not.toBeInTheDocument();
	} );
} );
