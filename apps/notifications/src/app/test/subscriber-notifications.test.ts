import { vi } from 'vitest';
import { subscribeUnseenCount } from '../client';
import { createNotificationSound } from '../notification-sound';
import { subscribeSubscriberNotifications } from '../subscriber-notifications';

vi.mock( '../client' );
vi.mock( '../notification-sound' );

describe( 'subscribeSubscriberNotifications', () => {
	const sound = { play: vi.fn(), dispose: vi.fn() };
	const unsubscribe = vi.fn();
	const candidate = {
		targetSiteId: 23,
		type: 'follow' as const,
		receivedAt: 100,
		wasVisibleAtReceipt: true,
	};
	let onLiveNotification: ( notification: typeof candidate ) => void;

	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( createNotificationSound ).mockReturnValue( sound );
		vi
			.mocked( subscribeUnseenCount )
			.mockImplementation( ( _wpcom, _onCount, onSubscriberNotification ) => {
				onLiveNotification = onSubscriberNotification!;
				return unsubscribe;
			} );
	} );

	it( 'plays and confirms a visible live follow note', () => {
		const onCount = vi.fn();
		const onConfirmed = vi.fn();
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

	it( 'reports the sound result and forwards the error reporter', () => {
		sound.play.mockReturnValueOnce( 'cooldown' );
		const onSound = vi.fn();
		const onError = vi.fn();
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), vi.fn(), {
			onSound,
			onError,
		} );

		onLiveNotification( candidate );

		expect( createNotificationSound ).toHaveBeenCalledWith( { onError } );
		expect( onSound ).toHaveBeenCalledWith( 'cooldown', candidate );
		stop();
	} );

	it( 'reports the sound result once audio that was still starting settles', async () => {
		sound.play.mockReturnValueOnce( Promise.resolve( 'played' ) );
		const onSound = vi.fn();
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), vi.fn(), { onSound } );

		onLiveNotification( candidate );
		expect( onSound ).not.toHaveBeenCalled();

		await Promise.resolve();
		expect( onSound ).toHaveBeenCalledWith( 'played', candidate );
		stop();
	} );

	it( 'does not report a sound result for a rejected candidate', () => {
		const onSound = vi.fn();
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), () => false, { onSound } );

		onLiveNotification( candidate );

		expect( onSound ).not.toHaveBeenCalled();
		stop();
	} );

	it( 'does not play audio when the alert consumer rejects a stale candidate', () => {
		const onConfirmed = vi.fn().mockReturnValue( false );
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), onConfirmed );

		onLiveNotification( candidate );

		expect( onConfirmed ).toHaveBeenCalledWith( candidate );
		expect( sound.play ).not.toHaveBeenCalled();
		stop();
	} );

	it( 'does not alert for a push received while hidden', () => {
		const onConfirmed = vi.fn();
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), onConfirmed );

		onLiveNotification( { ...candidate, wasVisibleAtReceipt: false } );

		expect( sound.play ).not.toHaveBeenCalled();
		expect( onConfirmed ).not.toHaveBeenCalled();
		stop();
	} );

	it( 'does not deliver alerts while the document is hidden', () => {
		const originalHidden = Object.getOwnPropertyDescriptor( document, 'hidden' );
		Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
		const onConfirmed = vi.fn();
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), onConfirmed );

		onLiveNotification( candidate );

		expect( sound.play ).not.toHaveBeenCalled();
		expect( onConfirmed ).not.toHaveBeenCalled();
		stop();
		if ( originalHidden ) {
			Object.defineProperty( document, 'hidden', originalHidden );
		}
	} );

	it( 'ignores callbacks after cleanup', () => {
		const onConfirmed = vi.fn();
		const stop = subscribeSubscriberNotifications( {}, vi.fn(), onConfirmed );

		stop();
		onLiveNotification( candidate );

		expect( sound.play ).not.toHaveBeenCalled();
		expect( onConfirmed ).not.toHaveBeenCalled();
		expect( sound.dispose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps count subscriptions without creating audio when alerts are disabled', () => {
		const stop = subscribeSubscriberNotifications( {}, vi.fn() );

		expect( subscribeUnseenCount ).toHaveBeenCalledTimes( 1 );
		expect( createNotificationSound ).not.toHaveBeenCalled();

		stop();
		expect( sound.dispose ).not.toHaveBeenCalled();
	} );
} );
