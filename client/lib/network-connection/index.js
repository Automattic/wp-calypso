/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:network-connection' ),
	Emitter = require( 'lib/mixins/emitter' ),
	request = require( 'superagent' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	PollerPool = require( 'lib/data-poller' );

import { connectionLost, connectionRestored } from 'state/application/actions';

var STATUS_CHECK_INTERVAL = 20000,
	connected = true,
	NetworkConnectionApp;

NetworkConnectionApp = {

	/**
	 * @returns {boolean}
	 */
	isEnabled: function() {
		return config.isEnabled( 'network-connection' );
	},

	/**
	 * Bootstraps network connection status change handler.
	 */
	init: function( reduxStore ) {
		var changeCallback;

		if ( ! this.isEnabled( 'network-connection' ) ) {
			return;
		}

		changeCallback = function() {
			if ( connected ) {
				debug( 'Showing notice "Connection restored".' );
				reduxStore.dispatch( connectionRestored( i18n.translate( 'Connection restored.' ) ) );
			} else {
				reduxStore.dispatch( connectionLost( i18n.translate( 'Not connected. Some information may be out of sync.' ) ) );
				debug( 'Showing notice "No internet connection".' );
			}
		};

		if ( config.isEnabled( 'desktop' ) ) {
			connected = typeof navigator !== 'undefined' ? !!navigator.onLine : true;

			window.addEventListener( 'online', this.emitConnected.bind( this ) );
			window.addEventListener( 'offline', this.emitDisconnected.bind( this ) );
		} else {
			PollerPool.add( this, 'checkNetworkStatus', {
				interval: STATUS_CHECK_INTERVAL
			} );
		}

		this.on( 'change', changeCallback );

		window.addEventListener( 'beforeunload', function() {
			debug( 'Removing listener.' );
			this.off( 'change', changeCallback );
		}.bind( this ) );
	},

	/**
	 * Checks network status by sending request to /version Calypso endpoint.
	 * When an error occurs it emits disconnected event, otherwise connected event.
	 */
	checkNetworkStatus: function() {
		debug( 'Checking network status.' );

		request.head( '/version?' + ( new Date() ).getTime() )
			.timeout( STATUS_CHECK_INTERVAL / 2 )
			.end( function( error, response ) { // eslint-disable-line no-unused-vars
				if ( error ) {
					this.emitDisconnected();
				} else {
					this.emitConnected();
				}
			}.bind( this ) );
	},

	/**
	 * Emits event when user's network connection is active.
	 */
	emitConnected: function() {
		if ( ! this.isEnabled( 'network-connection' ) ) {
			return;
		}

		if ( ! connected ) {
			connected = true;
			this.emit( 'change' );
		}
	},

	/**
	 * Emits event when user's network connection is broken.
	 */
	emitDisconnected: function() {
		if ( ! this.isEnabled( 'network-connection' ) ) {
			return;
		}

		if ( connected ) {
			connected = false;
			this.emit( 'change' );
		}
	},

	/**
	 * @returns {boolean}
	 */
	isConnected: function() {
		return connected;
	}
};

/**
 * Mixins
 */
Emitter( NetworkConnectionApp );

module.exports = NetworkConnectionApp;
