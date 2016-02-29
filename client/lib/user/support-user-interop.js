/**
 * External dependencies
 */
import debugModule from 'debug';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import store from 'store';
import { supportUserTokenFetch, supportUserActivate, supportUserError } from 'state/support/actions';

/**
 * Connects the Redux store and the low-level support user functions
 * of the wpcom library. When the support user token is changed in the
 * Redux store, the token is sent to the wpcom library. If a token
 * error occurs in a wpcom API call, the error is forwarded to the
 * Redux store via an action. This also forces any data refreshes
 * that are required due to the change of user.
 */

const debug = debugModule( 'calypso:support-user' );
const STORAGE_KEY = 'boot_support_user';

export const isEnabled = () => config.isEnabled( 'support-user' );

let _setReduxStore = noop;
const reduxStoreReady = new Promise( ( resolve ) => {
	if ( ! isEnabled() ) {
		return;
	}

	_setReduxStore = ( reduxStore ) => resolve( reduxStore );
} );
export const setReduxStore = _setReduxStore;

/**
 * Check if there's a support user to be activated on boot
 * @return {bool} true if a support user token is waiting to be injected on boot, false otherwise
 */
export const shouldBoot = () => {
	if ( ! isEnabled() ) {
		return false;
	}

	const supportUser = store.get( STORAGE_KEY );
	if ( supportUser && supportUser.user && supportUser.token ) {
		return true;
	}

	return false;
};

/**
 * Reboot normally as the main user
 */
export const rebootNormally = () => {
	if ( ! isEnabled() ) {
		return;
	}

	debug( 'Rebooting Calypso normally' );

	store.clear();
	window.location.reload();
};

/**
  * Reboot Calypso as the support user
  * @param  {string} user  The support user's username
  * @param  {string} token The support token
  */
export const rebootWithToken = ( user, token ) => {
	if ( ! isEnabled() ) {
		return;
	}

	debug( 'Rebooting Calypso with support user' );

	store.set( STORAGE_KEY, { user, token } );
	window.location.reload();
};

// Called when an API call fails due to a token error
const onTokenError = ( error ) => {
	debug( 'Deactivating support user and rebooting due to token error', error.message );
	rebootNormally();
};

/**
 * Inject the support user token into all following API calls
 */
export const boot = () => {
	if ( ! isEnabled() ) {
		return;
	}

	const { user, token } = store.get( STORAGE_KEY );
	debug( 'Booting Calypso with support user', user );

	const errorHandler = ( error ) => onTokenError( error );

	wpcom.setSupportUserToken( user, token, errorHandler );

	// boot() is called before the redux store is ready, so we need to
	// wait for it to become available
	reduxStoreReady.then( ( reduxStore ) => {
		reduxStore.dispatch( supportUserActivate() );
	} );
};

export const fetchToken = ( user, password ) => {
	if ( ! isEnabled() ) {
		return;
	}

	debug( 'Fetching support user token' );

	return reduxStoreReady.then( ( reduxStore ) => {
		reduxStore.dispatch( supportUserTokenFetch( user ) );

		const setToken = ( response ) => {
			rebootWithToken( response.username, response.token );
		};

		const errorFetchingToken = ( error ) => {
			reduxStore.dispatch( supportUserError( error.message ) );
		};

		return wpcom.fetchSupportUserToken( user, password )
			.then( setToken )
			.catch( errorFetchingToken );
	} );
};
