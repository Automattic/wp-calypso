/**
 * External dependencies
 */
import debugModule from 'debug';
import { noop, get } from 'lodash';
import qs from 'qs';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import store from 'store';
import localforage from 'lib/localforage';
import {
	supportUserTokenFetch,
	supportUserActivate,
	supportUserError,
	supportUserPrefill,
} from 'state/support/actions';
import localStorageBypass from 'lib/support/support-user/localstorage-bypass';

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

// Get the value of the `?support_user=` query param for prefilling
const getPrefillUsername = () => {
	const queryString = get( window, 'location.search', null );

	if ( ! queryString ) {
		return null;
	}

	// Remove the initial ? character
	const query = qs.parse( queryString.slice( 1 ) );
	return query.support_user || null;
}

// Check if we should prefill the support user login box
reduxStoreReady.then( reduxStore => {
	const prefillUsername = getPrefillUsername();

	if ( prefillUsername ) {
		reduxStore.dispatch( supportUserPrefill( prefillUsername ) );
	}
} );

// Evaluate isSupportUserSession at module startup time, then freeze it
// for the remainder of the session. This is needed because the User
// module clears the store on change; it could return false if called
// after boot.
const _isSupportUserSession = ( () => {
	if ( ! isEnabled() ) {
		return false;
	}

	const supportUser = store.get( STORAGE_KEY );
	if ( supportUser && supportUser.user && supportUser.token ) {
		return true;
	}

	return false;
} )();

export const isSupportUserSession = () => _isSupportUserSession;

/**
 * Reboot normally as the main user
 */
export const rebootNormally = () => {
	if ( ! isEnabled() ) {
		return;
	}

	debug( 'Rebooting Calypso normally' );

	store.remove( STORAGE_KEY );
	window.location.search = '';
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
	window.location.search = '';
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

	localforage.bypass();

	const { user, token } = store.get( STORAGE_KEY );
	debug( 'Booting Calypso with support user', user );
	store.remove( STORAGE_KEY );

	// The following keys will not be bypassed as
	// they are safe to share across user sessions.
	const allowedKeys = [ STORAGE_KEY, 'debug' ];
	localStorageBypass( allowedKeys );

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
