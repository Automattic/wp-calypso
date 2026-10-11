import { subscribeUnseenCount } from '../client';
import { createNotificationSound } from '../notification-sound';
import { subscribeSubscriberNotifications } from '../subscriber-notifications';

jest.mock( '../client' );
jest.mock( '../notification-sound' );

describe( 'subscribeSubscriberNotifications', () => {
	const sound = { play: jest.fn(), dispose: jest.fn() };
	const unsubscribe = jest.fn();
	const candidate = {
		targetSiteId: 23,
		type: 'follow' as const,
		receivedAt: 100,
		wasVisibleAtReceipt: true,
	};
	let onLiveNotification: ( notification: typeof candidate ) => void;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( createNotificationSound ).mockReturnValue( sound );
		jest
			.mocked( subscribeUnseenCount )
			.mockImplementation( ( _wpcom, _onCount, onSubscriberNotification ) => {
				onLiveNotification = onSubscriberNotification!;
				return unsubscribe;
			} );
	} );

	it( 'plays and confirms a visible live follow note', () => {
		const onCount = jest.fn();
		const onConfirmed = jest.fn();
		const stop = subscribeSubscriberNotifications( {}, onCount, onConfirmed );

		onLiveNotification( candidate );

		expect( subscribeUnseenCount ).toHaveBeenCalledTimes( 1 );
		expect( createNotificationSound ).toHaveBeenCalledTimes( 1 );
		expect( sound.play ).toHaveBeenCalledTimes( 1 );
		expect( onConfirmed ).toHaveBeenCalledWith( candidate );

		stop();
		expect( unsubscribe ).toHaveBeenCalledTimes( 1 );
		expect( sound.dispose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not play audio when the alert consumer rejects a stale candidate', () => {
		const onConfirmed = jest.fn().mockReturnValue( false );
		const stop = subscribeSubscriberNotifications( {}, jest.fn(), onConfirmed );

		onLiveNotification( candidate );

		expect( onConfirmed ).toHaveBeenCalledWith( candidate );
		expect( sound.play ).not.toHaveBeenCalled();
		stop();
	} );

	it( 'does not alert for a push received while hidden', () => {
		const onConfirmed = jest.fn();
		const stop = subscribeSubscriberNotifications( {}, jest.fn(), onConfirmed );

		onLiveNotification( { ...candidate, wasVisibleAtReceipt: false } );

		expect( sound.play ).not.toHaveBeenCalled();
		expect( onConfirmed ).not.toHaveBeenCalled();
		stop();
	} );

	it( 'does not deliver alerts while the document is hidden', () => {
		const originalHidden = Object.getOwnPropertyDescriptor( document, 'hidden' );
		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
		const onConfirmed = jest.fn();
		const stop = subscribeSubscriberNotifications( {}, jest.fn(), onConfirmed );

		onLiveNotification( candidate );

		expect( sound.play ).not.toHaveBeenCalled();
		expect( onConfirmed ).not.toHaveBeenCalled();
		stop();
		if ( originalHidden ) {
			Object.defineProperty( document, 'hidden', originalHidden );
		}
	} );

	it( 'ignores callbacks after cleanup', () => {
		const onConfirmed = jest.fn();
		const stop = subscribeSubscriberNotifications( {}, jest.fn(), onConfirmed );

		stop();
		onLiveNotification( candidate );

		expect( sound.play ).not.toHaveBeenCalled();
		expect( onConfirmed ).not.toHaveBeenCalled();
		expect( sound.dispose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps count subscriptions without creating audio when alerts are disabled', () => {
		const stop = subscribeSubscriberNotifications( {}, jest.fn() );

		expect( subscribeUnseenCount ).toHaveBeenCalledTimes( 1 );
		expect( createNotificationSound ).not.toHaveBeenCalled();

		stop();
		expect( sound.dispose ).not.toHaveBeenCalled();
	} );
} );
