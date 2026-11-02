/** @jest-environment jsdom */
import { isAutomatticianQuery, queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { MCP_SERVER_URL, HELPER_PROMPT } from '../connect-agents';
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

		const claude = screen.getByRole( 'link', { name: /^Claude App and desktop/ } );
		expect( claude ).toHaveAttribute( 'href', 'https://wp.me/claude' );
		expect( claude ).toHaveAttribute( 'target', '_blank' );
		expect( screen.getByRole( 'link', { name: /^ChatGPT/ } ) ).toHaveAttribute(
			'href',
			'https://wp.me/chatgpt'
		);
	} );

	test( 'copies the Claude Code command and confirms it', async () => {
		const { recordTracksEvent } = renderCard();

		await userEvent.click( screen.getByRole( 'button', { name: /^Claude Code/ } ) );

		expect( writeText ).toHaveBeenCalledWith(
			`claude mcp add --transport http wpcom-mcp ${ MCP_SERVER_URL }`
		);
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /^Claude Code.*Copied/ } ) ).toBeVisible()
		);
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

	test( 'offers to turn MCP access on while it is off', async () => {
		const onTurnOn = jest.fn();
		renderCard( { mcpEnabled: false, onTurnOn } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Turn on MCP access' } ) );

		expect( onTurnOn ).toHaveBeenCalled();
	} );

	test( 'hides the MCP-off notice while access is on', () => {
		renderCard();

		expect( screen.queryByText( 'MCP access is off' ) ).not.toBeInTheDocument();
	} );
} );
