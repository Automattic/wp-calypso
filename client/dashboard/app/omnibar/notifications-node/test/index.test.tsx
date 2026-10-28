/**
 * @jest-environment jsdom
 */

import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { omnibarEvents } from '../../events';
import { useNotificationsNodeBuilder } from '../index';

const notesNode = {
	id: 'notes',
	title:
		'<span title="Manage your notifications"><span id="wpnt-notes-unread-count" class="wpnt-loading wpn-read"></span><span class="noticon noticon-bell ab-icon"></span></span>',
	parent: 'top-secondary',
	href: 'https://wordpress.com/reader/notifications',
	group: false,
};

function NotificationsNodeOmnibar() {
	const { nodeBuilder } = useNotificationsNodeBuilder( {} );
	const { userNodes } = buildOmnibarNodesFromAdminBarNodes( [ notesNode ], {
		notes: nodeBuilder,
	} );
	return <Omnibar nodes={ { userNodes } } />;
}

describe( '<Omnibar> notifications node', () => {
	test( 'shows the node', async () => {
		render( <NotificationsNodeOmnibar /> );

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

		render( <NotificationsNodeOmnibar /> );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click(
			await within( toolbar ).findByRole( 'button', { name: 'Manage your notifications' } )
		);

		expect( onToggle ).toHaveBeenCalledTimes( 1 );
		unsubscribe();
	} );

	test( 'pulses the bell when a subscriber note arrives', async () => {
		render( <NotificationsNodeOmnibar /> );

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
