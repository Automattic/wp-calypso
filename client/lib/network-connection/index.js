/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:network-connection' ),
	Emitter = require( 'lib/mixins/emitter' ),
	request = require( 'superagent' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	PollerPool = require( 'lib/data-poller' ),
	i18n = require( 'lib/mixins/i18n' ),
	notices = require( 'notices' );

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
	init: function() {
		var changeCallback,
			disconnectedNotice = null,
			connectedNotice = null;

		if ( ! this.isEnabled( 'network-connection' ) ) {
			return;
		}

		changeCallback = function() {
			if ( connected ) {
				debug( 'Showing notice "Connection restored".' );
				if ( disconnectedNotice ) {
					notices.removeNotice( disconnectedNotice );
					disconnectedNotice = null;
				}
				connectedNotice = notices.success(
					i18n.translate( 'Connection restored.' ),
					{
						showDismiss: false,
						duration: 5000,
						persistent: true
					}
				);
			} else {
				debug( 'Showing notice "No internet connection".' );
				if ( connectedNotice ) {
					notices.removeNotice( connectedNotice );
					connectedNotice = null;
				}
				disconnectedNotice = notices.warning(
					i18n.translate( 'Not connected. Some information may be out of sync.' ),
					{
						showDismiss: false,
						persistent: true
					}
				);
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
