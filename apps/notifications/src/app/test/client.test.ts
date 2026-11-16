import { vi } from 'vitest';
import { store, init as initState } from '../../panel/state';
import { subscribeUnseenCount } from '../client';

vi.mock( '../../panel/rest-client', () =>
	( { default: vi.fn().mockImplementation( () => ( { setVisibility: vi.fn() } ) ) } )
);
vi.mock( '../../panel/rest-client/wpcom', () => ( { init: vi.fn() } ) );

describe( 'subscribeUnseenCount', () => {
	beforeEach( () => {
		initState();
	} );

	it( 'keeps one count callback and forwards each live subscriber candidate', () => {
		const onCount = vi.fn();
		const onSubscriberNotification = vi.fn();
		const subscriberNotifications = [
			{ targetSiteId: 23, type: 'follow', receivedAt: 100, wasVisibleAtReceipt: true },
			{ targetSiteId: 24, type: 'follow', receivedAt: 101, wasVisibleAtReceipt: true },
		];
		const unsubscribe = subscribeUnseenCount( {}, onCount, onSubscriberNotification );

		store.dispatch( {
			type: 'APP_RENDER_NOTES',
			newNoteCount: 2,
			subscriberNotifications,
		} );

		expect( onCount ).toHaveBeenCalledTimes( 1 );
		expect( onCount ).toHaveBeenCalledWith( 2 );
		expect( onSubscriberNotification ).toHaveBeenNthCalledWith( 1, subscriberNotifications[ 0 ] );
		expect( onSubscriberNotification ).toHaveBeenNthCalledWith( 2, subscriberNotifications[ 1 ] );

		unsubscribe();
		store.dispatch( {
			type: 'APP_RENDER_NOTES',
			newNoteCount: 1,
			subscriberNotifications,
		} );

		expect( onCount ).toHaveBeenCalledTimes( 1 );
		expect( onSubscriberNotification ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not invoke the optional callback for baseline render actions or existing two-argument subscribers', () => {
		const onCount = vi.fn();
		const onSubscriberNotification = vi.fn();
		const unsubscribe = subscribeUnseenCount( {}, onCount );
		const unsubscribeWithCallback = subscribeUnseenCount( {}, vi.fn(), onSubscriberNotification );

		store.dispatch( { type: 'APP_RENDER_NOTES', newNoteCount: 0 } );

		expect( onCount ).toHaveBeenCalledWith( 0 );
		expect( onSubscriberNotification ).not.toHaveBeenCalled();

		unsubscribe();
		unsubscribeWithCallback();
	} );
} );
