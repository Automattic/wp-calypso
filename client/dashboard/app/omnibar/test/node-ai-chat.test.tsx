/**
 * @jest-environment jsdom
 */

import { omnibarAgentsManagerEnabledQuery, omnibarSiteIdQuery } from '@automattic/api-queries';
import { analyticsEvents } from '@automattic/calypso-analytics';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { shoppingCartManagerClient } from '../../shopping-cart';
import OmnibarContainer from '../omnibar';

const myAccountNode = {
	id: 'my-account',
	title:
		"Howdy, <span class=\"display-name\">Test User</span><img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-28' />",
	parent: 'top-secondary',
	href: 'https://my.wordpress.com/me/account',
	group: false,
	meta: {
		menu_title: 'Howdy, Test User',
	},
};

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

function renderOmnibar( {
	enabled = true,
	sectionName,
}: { enabled?: boolean; sectionName?: string } = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, null );
	queryClient.setQueryData( omnibarAgentsManagerEnabledQuery().queryKey, enabled );

	return render(
		<OmnibarContainer
			cartManagerClient={ shoppingCartManagerClient }
			sectionName={ sectionName }
		/>,
		{ queryClient }
	);
}

describe( '<Omnibar> AI chat node', () => {
	const onRecordEvent = jest.fn();

	beforeEach( () => {
		analyticsEvents.on( 'record-event', onRecordEvent );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/dashboard/admin-bar' )
			.query( true )
			.reply( 200, { nodes: [ myAccountNode ] } );
	} );

	afterEach( () => {
		analyticsEvents.off( 'record-event', onRecordEvent );
		onRecordEvent.mockReset();
		nock.cleanAll();
		delete ( window as { __agentsManagerActions?: unknown } ).__agentsManagerActions;
	} );

	test( 'shows the node', async () => {
		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const node = await within( toolbar ).findByRole( 'button', { name: 'Agent' } );
		expect( within( node ).getByText( 'Agent' ) ).toBeVisible();
	} );

	test( 'hides the node when Agents Manager is not enabled', async () => {
		const { queryClient } = renderOmnibar( { enabled: false } );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await within( toolbar ).findByRole( 'button', { name: 'Howdy, Test User' } );
		await waitFor( () => expect( queryClient.isFetching() ).toBe( 0 ) );
		expect( within( toolbar ).queryByRole( 'button', { name: 'Agent' } ) ).not.toBeInTheDocument();
	} );

	test( 'opens the chat when clicking the node', async () => {
		const user = userEvent.setup();
		const actions = mockAgentsManagerActions();

		renderOmnibar( { sectionName: 'sites' } );

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

		renderOmnibar();

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
