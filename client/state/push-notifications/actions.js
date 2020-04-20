/**
 * External dependencies
 */

import debugFactory from 'debug';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	PUSH_NOTIFICATIONS_API_READY,
	PUSH_NOTIFICATIONS_API_NOT_READY,
	PUSH_NOTIFICATIONS_AUTHORIZE,
	PUSH_NOTIFICATIONS_BLOCK,
	PUSH_NOTIFICATIONS_TOGGLE_ENABLED,
	PUSH_NOTIFICATIONS_MUST_PROMPT,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS,
} from 'state/action-types';

import { isApiReady, getDeviceId, getStatus, isBlocked, isEnabled } from './selectors';
import {
	isOpera,
	isPushNotificationsDenied,
	isPushNotificationsSupported,
	isUnsupportedChromeVersion,
	getChromeVersion,
	getOperaVersion,
	urlBase64ToUint8Array,
} from './utils';
import { registerServerWorker } from 'lib/service-worker';
import { recordTracksEvent, bumpStat } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:push-notifications' );
const serviceWorkerOptions = {
	path: '/service-worker.js',
};

export function init() {
	return ( dispatch ) => {
		// require `lib/user/support-user-interop` here so that unit tests don't
		// fail because of lack of `window` global when importing this module
		// from test (before a chance to mock things is possible)
		// TODO: read the `isSupportSession` flag with a Redux selector instead. That requires
		// reorganizing the `configureReduxStore` function so that the flag is set *before* this
		// init function is called. That currently happens too late, in a promise resolution callback.
		const { isSupportSession } = require( 'lib/user/support-user-interop' );
		if ( isSupportSession() ) {
			debug( 'Push Notifications are not supported when SU is active' );
			dispatch( apiNotReady() );
			return;
		}

		// Only continue if the service worker supports notifications
		if ( ! isPushNotificationsSupported() ) {
			debug( 'Push Notifications are not supported' );
			dispatch( apiNotReady() );
			return;
		}

		if ( isUnsupportedChromeVersion() ) {
			debug( 'Push Notifications are not supported in Chrome 49 and below' );
			const chromeVersion = getChromeVersion();
			dispatch(
				bumpStat(
					'calypso_push_notif_unsup_chrome',
					chromeVersion > 39 && chromeVersion < 50 ? chromeVersion : 'other'
				)
			);
			dispatch( apiNotReady() );
			return;
		}

		// Opera claims to support PNs, but doesn't
		// http://forums.opera.com/discussion/1868659/opera-push-notifications/p1
		if ( isOpera() ) {
			debug( 'Push Notifications are not supported in Opera' );
			const operaVersion = getOperaVersion();
			dispatch(
				bumpStat(
					'calypso_push_notif_unsup_opera',
					operaVersion > 15 && operaVersion < 100 ? operaVersion : 'other'
				)
			);
			dispatch( apiNotReady() );
			return;
		}

		if ( isPushNotificationsDenied() ) {
			debug( 'Push Notifications have been denied' );
			dispatch( block() );
		}

		dispatch( fetchAndLoadServiceWorker() );
	};
}

export function apiNotReady() {
	return {
		type: PUSH_NOTIFICATIONS_API_NOT_READY,
	};
}

export function apiReady() {
	return ( dispatch, getState ) => {
		dispatch( {
			type: PUSH_NOTIFICATIONS_API_READY,
		} );
		const state = getState();

		if ( isBlocked( state ) ) {
			return;
		}

		if ( isEnabled( state ) ) {
			dispatch( activateSubscription() );
			return;
		}

		dispatch( checkPermissionsState() );
		if ( 'disabling' === getStatus( state ) ) {
			debug( 'Forcibly unregistering device (disabling on apiReady)' );
			dispatch( unregisterDevice() );
		}
	};
}

export function fetchAndLoadServiceWorker() {
	return ( dispatch ) => {
		debug( 'Registering service worker' );

		registerServerWorker( serviceWorkerOptions )
			.then( ( serviceWorkerRegistration ) => dispatch( apiReady( serviceWorkerRegistration ) ) )
			.catch( ( err ) => {
				debug( 'Error loading service worker!', err );
				dispatch( apiNotReady() );
			} );
	};
}

export function deactivateSubscription() {
	return ( dispatch ) => {
		navigator.serviceWorker
			.getRegistration( serviceWorkerOptions )
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager
					.getSubscription()
					.then( ( pushSubscription ) => {
						dispatch( unregisterDevice() );

						if ( ! ( pushSubscription && pushSubscription.unsubscribe ) ) {
							debug( 'Error getting push subscription to deactivate' );
							return;
						}

						pushSubscription
							.unsubscribe()
							.then( () => debug( 'Push subscription unsubscribed' ) )
							.catch( ( err ) => debug( 'Error while unsubscribing', err ) );
					} )
					.catch( ( err ) => {
						dispatch( unregisterDevice() );
						debug( 'Error getting subscription to deactivate', err );
					} );
			} )
			.catch( ( err ) => {
				dispatch( unregisterDevice() );
				debug( 'Error getting ServiceWorkerRegistration to deactivate', err );
			} );
	};
}

export function receivePermissionState( permission ) {
	return ( dispatch, getState ) => {
		if ( permission === 'granted' ) {
			debug( 'Push notifications authorized' );
			dispatch( {
				type: PUSH_NOTIFICATIONS_AUTHORIZE,
			} );
			dispatch( fetchPushManagerSubscription() );
			return;
		}

		if ( permission === 'denied' ) {
			dispatch( block() );
			return;
		}

		if ( isEnabled( getState() ) ) {
			// The user dismissed the prompt -- disable
			dispatch( toggleEnabled() );
		}
		dispatch( mustPrompt() );
	};
}

export function mustPrompt() {
	return {
		type: PUSH_NOTIFICATIONS_MUST_PROMPT,
	};
}
export function fetchPushManagerSubscription() {
	return ( dispatch ) => {
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager
					.getSubscription()
					.then( ( pushSubscription ) => {
						dispatch( sendSubscriptionToWPCOM( pushSubscription ) );
					} )
					.catch( ( err ) => debug( 'Error getting subscription', err ) );
			} )
			.catch( ( err ) => debug( 'Error fetching push manager subscription', err ) );
	};
}

export function sendSubscriptionToWPCOM( pushSubscription ) {
	return ( dispatch ) => {
		if ( ! pushSubscription ) {
			debug( 'No subscription to send to WPCOM' );
			return;
		}

		debug( 'Sending subscription to WPCOM', pushSubscription );
		return wpcom
			.undocumented()
			.registerDevice( JSON.stringify( pushSubscription ), 'browser', 'Browser' )
			.then( ( data, headers ) =>
				dispatch( {
					type: PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
					data,
					headers,
				} )
			)
			.catch( ( err ) => debug( "Couldn't register device", err ) );
	};
}

export function activateSubscription() {
	return ( dispatch, getState ) => {
		const state = getState();
		if ( isBlocked( state ) || ! isApiReady( state ) ) {
			return;
		}
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager
					.subscribe( {
						userVisibleOnly: true,
						applicationServerKey: urlBase64ToUint8Array( config( 'push_notification_vapid_key' ) ),
					} )
					.then( () => dispatch( checkPermissionsState() ) )
					.catch( ( err ) => {
						debug( "Couldn't get subscription", err );
						dispatch( checkPermissionsState() );
					} );
			} )
			.catch( ( err ) => debug( 'Error activating subscription', err ) );
	};
}

export function unregisterDevice() {
	return ( dispatch, getState ) => {
		const deviceId = getDeviceId( getState() );
		if ( ! deviceId ) {
			debug( "Couldn't unregister device. Unknown device ID" );
			dispatch( receiveUnregisterDevice() );
			return;
		}
		return wpcom
			.undocumented()
			.unregisterDevice( deviceId )
			.then( ( data ) => {
				debug( 'Successfully unregistered device', data );
				dispatch( receiveUnregisterDevice( data ) );
			} )
			.catch( ( err ) => {
				debug( "Couldn't unregister device", err );
				dispatch( receiveUnregisterDevice() );
			} );
	};
}

export function receiveUnregisterDevice( data ) {
	return {
		type: PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
		data: data ? data : {},
	};
}

export function checkPermissionsState() {
	return ( dispatch ) => {
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager
					.permissionState( { userVisibleOnly: true } )
					.then( ( permissionState ) => {
						debug( 'Received push messaging state', permissionState );
						dispatch( receivePermissionState( permissionState ) );
					} )
					.catch( ( err ) => {
						debug( 'Error checking permission state', err );
						dispatch( receivePermissionState( 'denied' ) );
					} );
			} )
			.catch( ( err ) => debug( 'Error checking permission state -- not ready', err ) );
	};
}

export function block() {
	return ( dispatch ) => {
		dispatch( {
			type: PUSH_NOTIFICATIONS_BLOCK,
		} );
		dispatch( deactivateSubscription() );
		dispatch( recordTracksEvent( 'calypso_web_push_notifications_blocked' ) );
	};
}

export function toggleEnabled() {
	return ( dispatch, getState ) => {
		const enabling = ! isEnabled( getState() );
		const doing = enabling ? 'enabling' : 'disabling';
		debug( doing );
		dispatch( {
			type: PUSH_NOTIFICATIONS_TOGGLE_ENABLED,
		} );
		if ( enabling ) {
			dispatch( fetchAndLoadServiceWorker() );
			dispatch( recordTracksEvent( 'calypso_web_push_notifications_enabled' ) );
		} else {
			dispatch( deactivateSubscription() );
			dispatch( recordTracksEvent( 'calypso_web_push_notifications_disabled' ) );
		}
	};
}

export function toggleUnblockInstructions() {
	return {
		type: PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS,
	};
}
