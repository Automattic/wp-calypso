/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { getLocalForage } from 'lib/localforage';
import config from 'config';
import { supportUserActivate } from 'state/support/actions';

const localforage = getLocalForage();
const debug = debugModule( 'calypso:support-user' );
const STORAGE_KEY = 'boot_support_user';

/**
 * Connects the Redux store and the low-level support user functions
 * of the wpcom library. When the support user token is changed in the
 * Redux store, the token is sent to the wpcom library. If a token
 * error occurs in a wpcom API call, the error is forwarded to the
 * Redux store via an action. This also forces any data refreshes
 * that are required due to the change of user.
 *
 * @param {Object}  reduxStore  The global redux store instance
 */
class SupportUser {
	constructor() {
		debug( 'Support User is enabled in this environment' );

		this.reduxStoreReady = new Promise( ( resolve ) => {
			this.setReduxStore = ( reduxStore ) => resolve( reduxStore );
		} );
	}

	/**
	 * Reboot normally as the main user
	 */
	rebootNormally() {
		debug( 'Rebooting Calypso normally' );

		localforage
			.removeItem( STORAGE_KEY )
			.then( window.location.reload );
	}

	/**
	 * Reboot Calypso as the support user
	 */
	rebootWithToken( user, token ) {
		debug( 'Rebooting Calypso with support user' );

		localforage
			.setItem( STORAGE_KEY, { user, token } )
			.then( window.location.reload );
	}

	/**
	 * Check if there's a support user to be activated on boot
	 * @return {bool} true if a support user token is waiting to be injected on boot, false otherwise
	 */
	shouldBootToSupportUser() {
		const checkForSupportToken = ( supportUser ) => {
			return ( supportUser && supportUser.user && supportUser.token );
		}

		return localforage
			.getItem( STORAGE_KEY )
			.then( checkForSupportToken );
	}

	/**
	 * Inject the support user token into all following API calls
	 */
	boot() {
		const setSupportUser = ( { user, token } ) => {
			debug( 'Booting Calypso with support user', user );

			const errorHandler = ( error ) => this._onTokenError( error );

			wpcom.setSupportUserToken( user, token, errorHandler );

			// boot() is called before the redux store is ready, so we need to
			// wait for it to become available
			this.reduxStoreReady.then( ( reduxStore ) => {
				reduxStore.dispatch( supportUserActivate() );
			} );
		}

		localforage
			.getItem( STORAGE_KEY )
			.then( setSupportUser );
	}

	// Called when an API call fails due to a token error
	_onTokenError( error ) {
		debug( 'Deactivating support user and rebooting due to token error', error.message );
		this.rebootNormally();
	}

	isEnabled() {
		return true;
	}
}

class DisabledSupportUser {
	rebootNormally() {}
	rebootWithToken() {}
	setReduxStore() {}
	shouldBootToSupportUser() { return false; }
	boot() {}
	isEnabled() { return false; }
}

let supportUser = null;
if ( config.isEnabled( 'support-user' ) ) {
	supportUser = new SupportUser();
} else {
	supportUser = new DisabledSupportUser();
}

export default supportUser;
