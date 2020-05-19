/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import PollerPool from 'lib/data-poller';
import Emitter from 'lib/mixins/emitter';
import { connectionLost, connectionRestored } from 'state/application/actions';

const debug = debugFactory( 'calypso:network-connection' );

const STATUS_CHECK_INTERVAL = 20000;
let connected = true;

function fetchWithTimeout( url, init, timeout = 0 ) {
	if ( ! timeout ) {
		return fetch( url, init );
	}

	return Promise.race( [
		fetch( url, init ),
		new Promise( ( resolve, reject ) => {
			setTimeout( () => reject( new Error() ), timeout );
		} ),
	] );
}

const NetworkConnectionApp = {
	/**
	 * Returns whether the network connection is enabled in config.
	 *
	 * @returns {boolean} whether the network connection is enabled in config
	 */
	isEnabled: function () {
		return config.isEnabled( 'network-connection' );
	},

	/**
	 * Bootstraps network connection status change handler.
	 *
	 * @param {Store} reduxStore The Redux store.
	 */
	init: function ( reduxStore ) {
		if ( ! this.isEnabled( 'network-connection' ) ) {
			return;
		}

		const changeCallback = () => {
			if ( connected ) {
				debug( 'Showing notice "Connection restored".' );
				reduxStore.dispatch( connectionRestored( i18n.translate( 'Connection restored.' ) ) );
			} else {
				reduxStore.dispatch(
					connectionLost( i18n.translate( 'Not connected. Some information may be out of sync.' ) )
				);
				debug( 'Showing notice "No internet connection".' );
			}
		};

		if ( config.isEnabled( 'desktop' ) ) {
			connected = typeof navigator !== 'undefined' ? !! navigator.onLine : true;

			window.addEventListener( 'online', this.emitConnected.bind( this ) );
			window.addEventListener( 'offline', this.emitDisconnected.bind( this ) );
		} else {
			PollerPool.add( this, 'checkNetworkStatus', {
				interval: STATUS_CHECK_INTERVAL,
			} );
		}

		this.on( 'change', changeCallback );

		window.addEventListener(
			'beforeunload',
			function () {
				debug( 'Removing listener.' );
				this.off( 'change', changeCallback );
			}.bind( this )
		);
	},

	/**
	 * Checks network status by sending request to /version Calypso endpoint.
	 * When an error occurs it emits disconnected event, otherwise connected event.
	 */
	checkNetworkStatus: function () {
		debug( 'Checking network status.' );

		fetchWithTimeout(
			'/version?' + new Date().getTime(),
			{ method: 'HEAD' },
			STATUS_CHECK_INTERVAL / 2
		).then(
			// Success
			() => this.emitConnected(),
			// Failure
			() => this.emitDisconnected()
		);
	},

	/**
	 * Emits event when user's network connection is active.
	 */
	emitConnected: function () {
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
	emitDisconnected: function () {
		if ( ! this.isEnabled( 'network-connection' ) ) {
			return;
		}

		if ( connected ) {
			connected = false;
			this.emit( 'change' );
		}
	},

	/**
	 * Returns whether the connections is currently active.
	 *
	 * @returns {boolean} whether the connections is currently active.
	 */
	isConnected: function () {
		return connected;
	},
};

/**
 * Mixins
 */
Emitter( NetworkConnectionApp );

export default NetworkConnectionApp;
