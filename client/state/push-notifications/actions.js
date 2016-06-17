/**
 * External dependencies
 */
import debugFactory from 'debug';
import moment from 'moment';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import {
	PUSH_NOTIFICATIONS_API_READY,
	PUSH_NOTIFICATIONS_API_NOT_READY,
	PUSH_NOTIFICATIONS_AUTHORIZE,
	PUSH_NOTIFICATIONS_BLOCK,
	PUSH_NOTIFICATIONS_TOGGLE_ENABLED,
	PUSH_NOTIFICATIONS_DISMISS_NOTICE,
	PUSH_NOTIFICATIONS_MUST_PROMPT,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS,
} from 'state/action-types';

import {
	isApiReady,
	getDeviceId,
	getLastUpdated,
	getStatus,
	isBlocked,
	isEnabled,
} from './selectors';
import {
	isPushNotificationsDenied,
	isPushNotificationsSupported,
} from './utils';
import {
	isServiceWorkerSupported,
	registerServerWorker,
} from 'lib/service-worker';
import {
	recordTracksEvent
} from 'state/analytics/actions';

const debug = debugFactory( 'calypso:push-notifications' );
const DAYS_BEFORE_FORCING_REGISTRATION_REFRESH = 15;
const serviceWorkerOptions = {
	path: '/service-worker.js',
};

export function init() {
	return dispatch => {
		// Only continue if the service worker supports notifications
		if ( ! isPushNotificationsSupported() ) {
			debug( 'Push Notifications are not supported' );
			dispatch( apiNotReady() );
			return;
		}

		if ( isPushNotificationsDenied() ) {
			debug( 'Push Notifications have been denied' );
			dispatch( block() );
			dispatch( apiReady() );
			return;
		}

		dispatch( fetchAndLoadServiceWorker() );
	};
}

export function apiNotReady() {
	return {
		type: PUSH_NOTIFICATIONS_API_NOT_READY
	};
}

export function apiReady() {
	return ( dispatch, getState ) => {
		dispatch( {
			type: PUSH_NOTIFICATIONS_API_READY
		} );
		const state = getState();

		if ( isBlocked( state ) ) {
			return;
		}

		if ( isEnabled( state ) ) {
			dispatch( activateSubscription() );
			return;
		}

		dispatch( mustPrompt() );
		if ( 'disabling' === getStatus( state ) ) {
			debug( 'Forcibly unregistering device (disabling on apiReady)' );
			dispatch( unregisterDevice() );
		}
	};
}

export function fetchAndLoadServiceWorker() {
	return dispatch => {
		if ( ! isServiceWorkerSupported() ) {
			debug( 'Service workers are not supported' );
			return;
		}
		debug( 'Registering service worker' );

		registerServerWorker( serviceWorkerOptions )
			.then( serviceWorkerRegistration => dispatch( apiReady( serviceWorkerRegistration ) ) )
			.catch( err => {
				debug( 'Error loading service worker!', err );
				dispatch( apiNotReady() );
			} )
		;
	};
}

export function deactivateSubscription() {
	return dispatch => {
		navigator.serviceWorker.getRegistration( serviceWorkerOptions )
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager.getSubscription()
					.then( pushSubscription => {
						dispatch( unregisterDevice() );

						if ( ! ( pushSubscription && pushSubscription.unsubscribe ) ) {
							debug( 'Error getting push subscription to deactivate' );
							return;
						}

						pushSubscription.unsubscribe()
							.then( () => debug( 'Push subscription unsubscribed' ) )
							.catch( err => debug( 'Error while unsubscribing', err ) )
						;
					} )
					.catch( err => {
						dispatch( unregisterDevice() );
						debug( 'Error getting subscription to deactivate', err );
					} )
				;
			} )
			.catch( err => {
				dispatch( unregisterDevice() );
				debug( 'Error getting ServiceWorkerRegistration to deactivate', err );
			} )
		;
	};
}

export function receivePermissionState( permission ) {
	return ( dispatch, getState ) => {
		if ( permission === 'granted' ) {
			debug( 'Push notifications authorized' );
			dispatch( {
				type: PUSH_NOTIFICATIONS_AUTHORIZE
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
		type: PUSH_NOTIFICATIONS_MUST_PROMPT
	};
}
export function fetchPushManagerSubscription() {
	return dispatch => {
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager.getSubscription()
					.then( pushSubscription => {
						dispatch( sendSubscriptionToWPCOM( pushSubscription ) );
					} )
					.catch( err => debug( 'Error getting subscription', err ) )
				;
			} )
			.catch( err => debug( 'Error fetching push manager subscription', err )	)
		;
	};
}

export function sendSubscriptionToWPCOM( pushSubscription ) {
	return ( dispatch, getState ) => {
		if ( ! pushSubscription ) {
			debug( 'No subscription to send to WPCOM' );
			return;
		}
		const state = getState();
		const lastUpdated = getLastUpdated( state );
		debug( 'Subscription last updated: ' + lastUpdated );

		let age;

		if ( lastUpdated ) {
			age = moment().diff( moment( lastUpdated ), 'days' );
			if ( age < DAYS_BEFORE_FORCING_REGISTRATION_REFRESH ) {
				debug( 'Subscription did not need updating.', age );
				return;
			}
			debug( 'Subscription needed updating.', age );
		}

		debug( 'Sending subscription to WPCOM', pushSubscription );
		return wpcom.undocumented().registerDevice( JSON.stringify( pushSubscription ), 'browser', 'Browser' )
			.then( data => dispatch( {
				type: PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
				data
			} ) )
			.catch( err => debug( 'Couldn\'t register device', err ) )
		;
	};
}

export function activateSubscription() {
	return ( dispatch, getState ) => {
		const state = getState();
		if ( isBlocked( state ) || ! isApiReady( state ) ) {
			return;
		}
		window.navigator.serviceWorker.ready
			.then( serviceWorkerRegistration => {
				serviceWorkerRegistration.pushManager.subscribe( { userVisibleOnly: true } )
					.then( () => dispatch( checkPermissionsState() ) )
					.catch( err => {
						debug( 'Couldn\'t get subscription', err );
						dispatch( checkPermissionsState() );
					} )
				;
			} )
			.catch( err => debug( 'Error activating subscription', err ) )
		;
	};
}

export function unregisterDevice() {
	return ( dispatch, getState ) => {
		const deviceId = getDeviceId( getState() );
		if ( ! deviceId ) {
			debug( 'Couldn\'t unregister device. Unknown device ID' );
			dispatch( receiveUnregisterDevice() );
			return;
		}
		return wpcom.undocumented().unregisterDevice( deviceId )
			.then( ( data ) => {
				debug( 'Successfully unregistered device', data );
				dispatch( receiveUnregisterDevice( data ) );
			} )
			.catch( err => {
				debug( 'Couldn\'t unregister device', err );
				dispatch( receiveUnregisterDevice() );
			} );
	};
}

export function receiveUnregisterDevice( data ) {
	return {
		type: PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
		data: data ? data : {}
	};
}

export function checkPermissionsState() {
	return dispatch => {
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager.permissionState( { userVisibleOnly: true } )
					.then( permissionState => {
						debug( 'Received push messaging state', permissionState );
						dispatch( receivePermissionState( permissionState ) );
					} )
					.catch( err => {
						debug( 'Error checking permission state', err );
						dispatch( receivePermissionState( 'denied', err ) );
					} )
				;
			} )
			.catch( err => debug( 'Error checking permission state -- not ready', err )	)
		;
	};
}

export function block() {
	return dispatch => {
		dispatch( {
			type: PUSH_NOTIFICATIONS_BLOCK
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
			type: PUSH_NOTIFICATIONS_TOGGLE_ENABLED
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
		type: PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS
	};
}

export function dismissNotice() {
	return {
		type: PUSH_NOTIFICATIONS_DISMISS_NOTICE
	};
}
