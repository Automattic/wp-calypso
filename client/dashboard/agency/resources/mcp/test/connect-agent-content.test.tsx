/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { AGENT_CONFIGS, DEFAULT_AGENT_ID } from '../agent-configs';
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
