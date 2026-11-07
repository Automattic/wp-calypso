/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { A4A_MCP_URL, AGENT_CONFIGS, DEFAULT_AGENT_ID } from '../agent-configs';
import McpConnectAgent from '../connect-agent-content';

let clipboardWriteText: jest.Mock;

beforeEach( () => {
	clipboardWriteText = jest.fn().mockResolvedValue( undefined );
	Object.defineProperty( window.navigator, 'clipboard', {
		value: { writeText: clipboardWriteText },
		configurable: true,
	} );
} );

const defaultAgent = AGENT_CONFIGS.find( ( agent ) => agent.id === DEFAULT_AGENT_ID )!;

describe( '<McpConnectAgent>', () => {
	test( 'offers every configured assistant and starts on the default', () => {
		render( <McpConnectAgent /> );

		const select = screen.getByRole( 'combobox', { name: 'AI assistant' } );
		expect( select ).toHaveValue( DEFAULT_AGENT_ID );
		for ( const agent of AGENT_CONFIGS ) {
			expect( screen.getByRole( 'option', { name: agent.label } ) ).toBeInTheDocument();
		}
	} );

	test( 'shows the quick setup steps for the selected assistant', () => {
		render( <McpConnectAgent /> );

		expect( screen.getByRole( 'heading', { name: 'Quick setup' } ) ).toBeVisible();
		expect( screen.getByText( defaultAgent.quickSetupDescription as string ) ).toBeVisible();
		// Every quick setup step is rendered as a list item.
		expect( screen.getAllByRole( 'listitem' ).length ).toBeGreaterThanOrEqual(
			defaultAgent.quickSetup!.length
		);
	} );

	test( 'switching assistants swaps the instructions and records the choice', async () => {
		const recordTracksEvent = jest.fn();
		const other = AGENT_CONFIGS.find( ( agent ) => agent.id !== DEFAULT_AGENT_ID )!;
		render( <McpConnectAgent recordTracksEvent={ recordTracksEvent } /> );

		await userEvent.selectOptions(
			screen.getByRole( 'combobox', { name: 'AI assistant' } ),
			other.id
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_ai_mcp_connect_agent_selected', {
			agent_id: other.id,
		} );
		expect( screen.getByRole( 'link', { name: new RegExp( other.docsLabel ) } ) ).toBeVisible();
	} );

	test( 'copies the fallback configuration and records a tracks event', async () => {
		const recordTracksEvent = jest.fn();
		render( <McpConnectAgent recordTracksEvent={ recordTracksEvent } /> );

		expect(
			screen.getByRole( 'heading', { name: 'Older clients or troubleshooting' } )
		).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Copy configuration' } ) );

		expect( clipboardWriteText ).toHaveBeenCalledWith( defaultAgent.fallbackSetup!.snippet );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_ai_mcp_fallback_config_copied', {
			agent_id: defaultAgent.id,
		} );
	} );

	test( 'links to the documentation for the selected assistant', () => {
		render( <McpConnectAgent /> );

		expect(
			screen.getByRole( 'link', { name: new RegExp( defaultAgent.docsLabel ) } )
		).toHaveAttribute( 'href', defaultAgent.docsUrl );
	} );
} );

const nativeClients = [
	{ id: 'cursor', label: 'Cursor', configKey: 'mcpServers' },
	{ id: 'vscode', label: 'VS Code', configKey: 'servers' },
];

describe.each( nativeClients )( '$label native HTTP setup', ( { id, label, configKey } ) => {
	test( 'installs the remote URL directly from the one-click link', async () => {
		render( <McpConnectAgent /> );
		await userEvent.selectOptions( screen.getByRole( 'combobox', { name: 'AI assistant' } ), id );

		const href = screen
			.getByRole( 'link', { name: `Install in ${ label }` } )
			.getAttribute( 'href' )!;
		const link = new URL( href );
		const config =
			id === 'cursor'
				? JSON.parse( atob( link.searchParams.get( 'config' )! ) )
				: JSON.parse( decodeURIComponent( link.search.slice( 1 ) ) );

		const installedName = id === 'cursor' ? link.searchParams.get( 'name' ) : config.name;
		expect( installedName ).toBe( 'automattic-agencies-mcp' );
		expect( config ).toEqual(
			id === 'cursor'
				? { url: A4A_MCP_URL }
				: { name: 'automattic-agencies-mcp', type: 'http', url: A4A_MCP_URL }
		);
		expect( JSON.stringify( config ) ).not.toContain( 'mcp-remote' );
	} );

	test( 'shows a native manual configuration without requiring Node in quick setup', async () => {
		render( <McpConnectAgent /> );
		await userEvent.selectOptions( screen.getByRole( 'combobox', { name: 'AI assistant' } ), id );

		const manual = screen.getAllByRole( 'textbox' )[ 0 ] as HTMLTextAreaElement;
		const server = JSON.parse( manual.value )[ configKey ][ 'automattic-agencies-mcp' ];
		expect( server ).toEqual(
			id === 'cursor' ? { url: A4A_MCP_URL } : { type: 'http', url: A4A_MCP_URL }
		);
		expect( manual ).not.toHaveValue( expect.stringContaining( 'mcp-remote' ) );
		const quickSetup = screen
			.getByRole( 'heading', { name: 'Quick setup' } )
			.closest( '.components-card' );
		expect( quickSetup ).not.toHaveTextContent( 'Install Node' );
	} );

	test( 'retains the Node bridge as a copyable fallback', async () => {
		const recordTracksEvent = jest.fn();
		render( <McpConnectAgent recordTracksEvent={ recordTracksEvent } /> );
		await userEvent.selectOptions( screen.getByRole( 'combobox', { name: 'AI assistant' } ), id );

		expect(
			screen.getByRole( 'heading', { name: 'Older clients or troubleshooting' } )
		).toBeVisible();
		const fallback = screen.getAllByRole( 'textbox' )[ 1 ] as HTMLTextAreaElement;
		expect( JSON.parse( fallback.value )[ configKey ][ 'automattic-agencies-mcp' ] ).toEqual( {
			command: 'npx',
			args: [ '-y', '@automattic/mcp-remote', A4A_MCP_URL ],
		} );
		await userEvent.click( screen.getAllByRole( 'button', { name: 'Copy configuration' } )[ 1 ] );
		expect( clipboardWriteText ).toHaveBeenCalledWith( fallback.value );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_ai_mcp_fallback_config_copied', {
			agent_id: id,
		} );
	} );
} );
