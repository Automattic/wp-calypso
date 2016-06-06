/**
 * External dependencies
 */
import Emitter from 'lib/mixins/emitter';
import debugFactory from 'debug';
import moment from 'moment';
import store from 'store';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';

const DAYS_BEFORE_FORCING_REGISTRATION_REFRESH = 15,
	debug = debugFactory( 'calypso:push-notifications' );

let _pushNotifications = false;

function initializeState() {
	// Only continue if the service worker supports notifications
	if ( ! ( ( 'ServiceWorkerRegistration' in window ) && ( 'showNotification' in window.ServiceWorkerRegistration.prototype ) ) ) {
		debug( 'Notifications not supported' );
		return;
	}

	// If the user denied notifications permission, we cannot prompt again; the user must change the permission
	if ( ( ! ( 'Notification' in window ) ) || 'denied' === window.Notification.permission ) {
		debug( 'Permission denied' );
		this.setState( 'denied' );
		return;
	}

	// Only continue if push messaging is supported
	if ( ! ( 'PushManager' in window ) ) {
		debug( 'Push messaging not supported' );
		return;
	}

	window.navigator.serviceWorker.ready.then( registerServiceWorker.bind( this ) );
}

function registerServiceWorker( serviceWorkerRegistration ) {
	debug( 'Registering service worker' );
	// Grab existing subscription if we have it
	serviceWorkerRegistration.pushManager.getSubscription().then( ( subscription ) => {
		if ( ! subscription ) {
			debug( 'Permission not yet granted' );
			this.setState( 'unsubscribed' );
			if ( store.get( 'push-subscription-intent' ) ) {
				// If the user has shown the intent to subscribe, we should attempt to subscribe them.
				debug( 'Attempting to subscribe based on user-intent...' );
				this.subscribe();
			}
			return;
		}

		this.setState( 'subscribed' );
		this.saveSubscription( subscription );
	} ).catch( ( err ) => {
		debug( 'Error in getSubscription()', err );
	} );
}

/**
 * PushNotifications component
 *
 * @api public
 */

function PushNotifications() {
	// state is one of 'unknown', 'subscribed', 'unsubscribed', or 'denied'
	this.state = 'unknown';
	this.initialize();
	return this;
}

PushNotifications.prototype.initialize = function() {
	if ( ! config.isEnabled( 'push-notifications' ) ) {
		return;
	}

	// Only register the service worker in browsers that support it.
	if ( 'serviceWorker' in window.navigator ) {
		window.navigator.serviceWorker.ready.then( () => {
			window.navigator.serviceWorker.register( '/service-worker.js' ).then( initializeState.bind( this ) ).catch( ( err ) => {
				debug( 'Service worker not supported', err );
			} );
		} ).catch( ( err ) => {
			debug( 'Service worker not supported', err );
		} );
	} else {
		debug( 'Service worker not supported' );
	}
};

PushNotifications.prototype.setState = function( state, callback ) {
	debug( 'Switching state to %s', state );
	this.state = state;
	if ( 'function' === typeof callback ) {
		callback( state );
	}
	this.emit( 'change' );
};

PushNotifications.prototype.deleteSubscription = function() {
	const deviceId = store.get( 'push-subscription-device-id' );
	if ( ! deviceId ) {
		debug( 'Couldn\'t unregister device due to missing id' );
		return;
	}

	wpcom.undocumented().unregisterDevice( deviceId ).then( ( data ) => {
		if ( data.success ) {
			store.remove( 'push-subscription-device-id' );
			debug( 'Deleted subscription with id', deviceId );
		} else {
			debug( 'Couldn\'t unregister device' );
		}
	} ).catch( ( error ) => {
		debug( 'Couldn\'t unregister device', error );
	} );
};

PushNotifications.prototype.saveSubscription = function( subscription ) {
	const sub = JSON.stringify( subscription ),
		oldSub = store.get( 'push-subscription' ),
		lastUpdated = store.get( 'push-subscription-updated' );

	let age;

	if ( lastUpdated ) {
		age = moment().diff( moment( lastUpdated ), 'days' );
	}

	if ( oldSub !== sub || ( ! lastUpdated ) || age > DAYS_BEFORE_FORCING_REGISTRATION_REFRESH ) {
		debug( 'Subscription needed updating.', age );
		wpcom.undocumented().registerDevice( sub, 'browser', 'Browser' ).then( ( data ) => {
			debug( 'Subscription id', data.ID );
			store.set( 'push-subscription-device-id', data.ID );

			store.set( 'push-subscription', sub );
			store.set( 'push-subscription-updated', moment().format() );
			debug( 'Saved subscription', subscription );
		} ).catch( ( error ) => {
			debug( 'Couldn\'t register device', error );
		} );
	} else {
		debug( 'Subscription did not need updating.', age );
	}
};

PushNotifications.prototype.subscribe = function( callback ) {
	debug( 'Triggering browser UI for permission' );
	if ( 'serviceWorker' in window.navigator ) {
		// We store the user's intent to subscribe, so that, in the event they deny the subscription
		// and later attempt to correct that, we can autosubscribe
		store.set( 'push-subscription-intent', true );
		window.navigator.serviceWorker.ready.then( ( serviceWorkerRegistration ) => {
			serviceWorkerRegistration.pushManager.subscribe( { userVisibleOnly: true } ).then( ( subscription ) => {
				serviceWorkerRegistration.pushManager.permissionState( { userVisibleOnly: true } ).then( ( pushMessagingState ) => {
					if ( 'granted' === pushMessagingState ) {
						this.setState( 'subscribed', callback );
						this.saveSubscription( subscription );
					} else if ( 'prompt' === pushMessagingState ) {
						this.setState( 'unsubscribed', callback );
						this.unsubscribe( callback );
					}
				} );
			} ).catch( ( err ) => {
				if ( 'denied' === window.Notification.permission ) {
					debug( 'Permission denied' );
					this.setState( 'denied', callback );
				} else {
					debug( 'Couldn\'t subscribe', err );
					this.setState( 'unknown', callback );
				}
			} );
		} );
	}
};

PushNotifications.prototype.unsubscribe = function( callback ) {
	if ( 'serviceWorker' in window.navigator ) {
		store.remove( 'push-subscription-intent' );
		window.navigator.serviceWorker.ready.then( ( serviceWorkerRegistration ) => {
			serviceWorkerRegistration.pushManager.getSubscription().then( ( pushSubscription ) => {
				if ( ! pushSubscription ) {
					this.setState( 'unsubscribed', callback );
					return;
				}

				this.deleteSubscription();

				pushSubscription.unsubscribe().then( () => {
					this.setState( 'unsubscribed', callback );
				} ).catch( ( err ) => {
					debug( 'Error while unsubscribing', err );
					this.setState( 'unknown', callback );
				} );
			} ).catch( ( err ) => {
				debug( 'Error while unsubscribing', err );
				this.setState( 'unknown', callback );
			} );
		} );
	}
};

/**
 * Mixins
 */
Emitter( PushNotifications.prototype );

module.exports = function() {
	if ( ! _pushNotifications ) {
		_pushNotifications = new PushNotifications();
	}
	return _pushNotifications;
};
