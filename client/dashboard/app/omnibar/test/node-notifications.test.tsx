/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { shoppingCartManagerClient } from '../../shopping-cart';
import { omnibarEvents } from '../events';
import OmnibarContainer from '../omnibar';
import type { AppConfig } from '../../context';

const config: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		notifications: true,
	},
};

const notesNode = {
	id: 'notes',
	title:
		'<span title="Manage your notifications"><span id="wpnt-notes-unread-count" class="wpnt-loading wpn-read"></span><span class="noticon noticon-bell ab-icon"></span></span>',
	parent: 'top-secondary',
	href: 'https://wordpress.com/reader/notifications',
	group: false,
};

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

function renderOmnibar() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, null );

	return render( <OmnibarContainer cartManagerClient={ shoppingCartManagerClient } />, {
		config,
		queryClient,
	} );
}

describe( '<Omnibar> notifications node', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/dashboard/admin-bar' )
			.query( true )
			.reply( 200, { nodes: [ notesNode, myAccountNode ] } );
	} );

	afterEach( () => nock.cleanAll() );

	test( 'shows the node', async () => {
		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const notificationsNode = await within( toolbar ).findByRole( 'button', {
			name: 'Manage your notifications',
		} );
		expect( notificationsNode ).toBeVisible();
	} );

	test( 'asks the host app to toggle the notifications panel when clicking the node', async () => {
		const user = userEvent.setup();
		const onToggle = jest.fn();
		const unsubscribe = omnibarEvents.notifications.subscribe( onToggle );

		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click(
			await within( toolbar ).findByRole( 'button', { name: 'Manage your notifications' } )
		);

		expect( onToggle ).toHaveBeenCalledTimes( 1 );
		unsubscribe();
	} );

	test( 'pulses the bell when a subscriber note arrives', async () => {
		renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const notificationsNode = await within( toolbar ).findByRole( 'button', {
			name: 'Manage your notifications',
		} );
		// The pulse is a purely visual animation, so its class is the only thing to assert.
		const getBell = () => notificationsNode.querySelector( '.omnibar__notifications-icon' );
		expect( getBell() ).not.toHaveClass( 'omnibar__notifications-icon--subscriber-pulse' );

		act( () => omnibarEvents.notificationsSubscriberReceived.emit() );

		expect( getBell() ).toHaveClass( 'omnibar__notifications-icon--subscriber-pulse' );
	} );
} );
