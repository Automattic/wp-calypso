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

let _pushNotifications = false;

const debug = debugFactory( 'calypso:push-notifications' );

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
		window.navigator.serviceWorker.register( '/service-worker.js' ).then( initializeState.bind( this ) ).catch( function( err ) {
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
	// @todo: delete the subscription
	debug( 'Delete subscription' );
};

PushNotifications.prototype.saveSubscription = function( subscription ) {
	const sub = JSON.stringify( subscription ),
		oldSub = store.get( 'push-subscription' ),
		lastUpdated = store.get( 'push-subscription-updated' );

	var age;

	if ( lastUpdated ) {
		age = moment().diff( moment( lastUpdated ), 'days' );
	}

	if ( oldSub !== sub || ( ! lastUpdated ) || age > 15 ) {
		debug( 'Subscription needed updating.', age );
		wpcom.undocumented().registerDevice( sub, 'chrome', 'Chrome', function() {
			store.set( 'push-subscription', sub );
			store.set( 'push-subscription-updated', moment().format() );
			debug( 'Saved subscription', subscription );
		} );
	} else {
		debug( 'Subscription did not need updating.', age );
	}
};

PushNotifications.prototype.subscribe = function( callback ) {
	debug( 'Triggering browser UI for permission' );
	if ( 'serviceWorker' in window.navigator ) {
		window.navigator.serviceWorker.ready.then( ( serviceWorkerRegistration ) => {
			serviceWorkerRegistration.pushManager.subscribe( { userVisibleOnly: true } ).then( ( subscription ) => {
				this.setState( 'subscribed', callback );
				this.saveSubscription( subscription );
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
