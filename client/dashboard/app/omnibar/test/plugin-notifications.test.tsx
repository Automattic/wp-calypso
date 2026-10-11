/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';
import { omnibarEvents } from '../events';
import { useNotificationsPlugin } from '../plugin-notifications';

function NotificationsPlugin() {
	const node = useNotificationsPlugin( {} );
	return <div>{ node.icon }</div>;
}

describe( 'useNotificationsPlugin', () => {
	it( 'pulses the bell when a subscriber note arrives', () => {
		const { container } = render( <NotificationsPlugin /> );

		expect( container.querySelector( '.omnibar__notifications-icon' ) ).not.toHaveClass(
			'omnibar__notifications-icon--subscriber-pulse'
		);

		act( () => omnibarEvents.notificationsSubscriberReceived.emit() );

		expect( container.querySelector( '.omnibar__notifications-icon' ) ).toHaveClass(
			'omnibar__notifications-icon--subscriber-pulse'
		);
	} );
} );
