/**
 * @jest-environment jsdom
 */

import { omnibarAgentsManagerEnabledQuery } from '@automattic/api-queries';
import { analyticsEvents } from '@automattic/calypso-analytics';
import { Omnibar } from '@automattic/omnibar';
import { QueryClient } from '@tanstack/react-query';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { useAiChatNode } from '../index';

// The actions the Agents Manager app publishes for entry points such as the omnibar.
function mockAgentsManagerActions( { isChatVisible = false } = {} ) {
	const actions = {
		isReady: true,
		isChatVisible: () => isChatVisible,
		resumeChat: jest.fn(),
		setChatOpen: jest.fn(),
	};
	( window as unknown as { __agentsManagerActions?: typeof actions } ).__agentsManagerActions =
		actions;
	return actions;
}

function AiChatNodeOmnibar( { sectionName }: { sectionName?: string } ) {
	const { node } = useAiChatNode( { sectionName, adminBarNodes: [] } );
	return <Omnibar nodes={ { userNodes: node ? [ node ] : [] } } />;
}

function renderNode( {
	enabled = true,
	sectionName,
}: { enabled?: boolean; sectionName?: string } = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarAgentsManagerEnabledQuery().queryKey, enabled );

	return render( <AiChatNodeOmnibar sectionName={ sectionName } />, { queryClient } );
}

describe( '<Omnibar> AI chat node', () => {
	const onRecordEvent = jest.fn();

	beforeEach( () => {
		analyticsEvents.on( 'record-event', onRecordEvent );
	} );

	afterEach( () => {
		analyticsEvents.off( 'record-event', onRecordEvent );
		onRecordEvent.mockReset();
		delete ( window as { __agentsManagerActions?: unknown } ).__agentsManagerActions;
	} );

	test( 'shows the node', async () => {
		renderNode();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const node = await within( toolbar ).findByRole( 'button', { name: 'Agent' } );
		expect( within( node ).getByText( 'Agent' ) ).toBeVisible();
	} );

	test( 'hides the node when Agents Manager is not enabled', () => {
		renderNode( { enabled: false } );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		expect( within( toolbar ).queryByRole( 'button', { name: 'Agent' } ) ).not.toBeInTheDocument();
	} );

	test( 'opens the chat when clicking the node', async () => {
		const user = userEvent.setup();
		const actions = mockAgentsManagerActions();

		renderNode( { sectionName: 'sites' } );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click( await within( toolbar ).findByRole( 'button', { name: 'Agent' } ) );

		expect( actions.resumeChat ).toHaveBeenCalledTimes( 1 );
		expect( actions.setChatOpen ).toHaveBeenCalledWith( true );
		expect( onRecordEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			expect.objectContaining( { surface: 'masterbar', section: 'sites', action: 'open' } )
		);
	} );

	test( 'closes the chat when clicking the node while the chat is visible', async () => {
		const user = userEvent.setup();
		const actions = mockAgentsManagerActions( { isChatVisible: true } );

		renderNode();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click( await within( toolbar ).findByRole( 'button', { name: 'Agent' } ) );

		expect( actions.setChatOpen ).toHaveBeenCalledWith( false );
		expect( actions.resumeChat ).not.toHaveBeenCalled();
		expect( onRecordEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_ai_chat_clicked',
			expect.objectContaining( { surface: 'masterbar', section: 'unknown', action: 'close' } )
		);
	} );
} );
