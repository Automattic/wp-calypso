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
	PUSH_NOTIFICATIONS_RECEIVE_SUBSCRIPTION,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS,
} from 'state/action-types';

import {
	isApiReady,
	getDeviceId,
	getLastUpdated,
	getSavedSubscription,
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
const debug = debugFactory( 'calypso:push-notifications' );
const DAYS_BEFORE_FORCING_REGISTRATION_REFRESH = 15;

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
		} else {
			dispatch( {
				type: PUSH_NOTIFICATIONS_MUST_PROMPT
			} );
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

		registerServerWorker()
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
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager.getSubscription()
					.then( pushSubscription => {
						if ( ! pushSubscription ) {
							debug( 'Deactivated subscription' );
							dispatch( receiveSubscription( null ) );
							return;
						}

						dispatch( unregisterDevice() );

						pushSubscription.unsubscribe()
							.then( () => {
								dispatch( receiveSubscription( null ) );
							} )
							.catch( err => {
								debug( 'Error while unsubscribing', err );
							} )
						;
					} )
					.catch( err => {
						debug( 'Error getting subscription to deactivate', err );

						// @TODO is this correct behavior?
						dispatch( receiveSubscription( null ) );
					} )
				;
			} );
	};
}

export function receivePermissionState( permission ) {
	return dispatch => {
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

		dispatch( {
			type: PUSH_NOTIFICATIONS_MUST_PROMPT
		} );
		dispatch( toggleEnabled() );
	};
}

export function fetchPushManagerSubscription() {
	return dispatch => {
		window.navigator.serviceWorker.ready
			.then( ( serviceWorkerRegistration ) => {
				serviceWorkerRegistration.pushManager.getSubscription()
					.then( pushSubscription => {
						dispatch( receiveSubscription( pushSubscription ) );
						dispatch( sendSubscriptionToWPCOM() );
					} )
					.catch( err => debug( 'Error getting subscription', err ) )
				;
			} )
			.catch( err => debug( 'Error fetching push manager subscription', err )	)
		;
	};
}

export function sendSubscriptionToWPCOM() {
	return ( dispatch, getState ) => {
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
		}

		debug( 'Subscription needed updating.', age );

		const sub = getSavedSubscription( state );
		if ( ! sub ) {
			debug( 'No subscription to send to WPCOM' );
			// @TODO dispatch something :)
			return;
		}
		debug( 'Sending subscription to WPCOM', sub );

		wpcom.undocumented().registerDevice( JSON.stringify( sub ), 'browser', 'Browser' )
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
					.then( subscription => {
						dispatch( receiveSubscription( subscription ) );
						dispatch( checkPermissionsState() );
					} )
					.catch( err => {
						debug( 'Error receiving subscription', err );
						dispatch( block() );
					} )
				;
			} )
			.catch( err => debug( 'Error activating subscription', err )	)
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
		wpcom.undocumented().unregisterDevice( deviceId )
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
	return {
		type: PUSH_NOTIFICATIONS_BLOCK
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
		} else {
			dispatch( deactivateSubscription() );
		}
	};
}

export function receiveSubscription( subscription ) {
	return {
		type: PUSH_NOTIFICATIONS_RECEIVE_SUBSCRIPTION,
		subscription
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
