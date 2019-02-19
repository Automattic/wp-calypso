/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import localforage from 'lib/localforage';
import { supportSessionActivate } from 'state/support/actions';
import localStorageBypass from 'lib/local-storage-bypass';

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

const isEnabled = () => config.isEnabled( 'support-user' );

let _setReduxStore = noop;
const reduxStoreReady = new Promise( resolve => {
	if ( ! isEnabled() ) {
		return;
	}

	_setReduxStore = reduxStore => resolve( reduxStore );
} );
export const setSupportSessionReduxStore = _setReduxStore;

const getStorageItem = () => {
	try {
		return JSON.parse( window.sessionStorage.getItem( STORAGE_KEY ) );
	} catch ( error ) {
		return {};
	}
};

// Evaluate isSupportUserSession at module startup time, then freeze it
// for the remainder of the session. This is needed because the User
// module clears the store on change; it could return false if called
// after boot.
const _isSupportUserSession = ( () => {
	if ( ! isEnabled() ) {
		return false;
	}

	const supportUser = getStorageItem();

	return supportUser && supportUser.user && supportUser.token;
} )();

export const isSupportUserSession = () => _isSupportUserSession;

// Detect the next-style support session
export const isSupportNextSession = () => {
	if ( ! isEnabled() ) {
		return false;
	}

	return !! ( typeof window !== 'undefined' && window.isSupportSession );
};

// Detect a support session, no matter the implementation
export const isSupportSession = () => isSupportUserSession() || isSupportNextSession();

let onBeforeUnload;

const storeUserAndToken = ( user, token ) => () => {
	if ( ! isEnabled() ) {
		return;
	}

	if ( user && token ) {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( { user, token } ) );
	}
};

/**
 * Reboot normally as the main user
 */
export const rebootNormally = () => {
	if ( ! isEnabled() ) {
		return;
	}

	debug( 'Rebooting Calypso normally' );

	window.sessionStorage.removeItem( STORAGE_KEY );
	window.removeEventListener( 'beforeunload', onBeforeUnload );
	window.location.search = '';
};

// Called when an API call fails due to a token error
const onTokenError = error => {
	debug( 'Deactivating support user and rebooting due to token error', error.message );
	rebootNormally();
};

/**
 * Inject the support user token into all following API calls
 */
export const supportUserBoot = () => {
	if ( ! isEnabled() ) {
		return;
	}

	const { user, token } = getStorageItem();
	debug( 'Booting Calypso with support user', user );

	window.sessionStorage.removeItem( STORAGE_KEY );

	onBeforeUnload = storeUserAndToken( user, token );
	window.addEventListener( 'beforeunload', onBeforeUnload );

	localforage.bypass();

	// The following keys will not be bypassed as
	// they are safe to share across user sessions.
	const allowedKeys = [ STORAGE_KEY, 'debug' ];
	localStorageBypass( allowedKeys );

	wpcom.setSupportUserToken( user, token, onTokenError );

	// the boot is performed before the Redux store is created, so we need to wait for a promise
	reduxStoreReady.then( reduxStore => reduxStore.dispatch( supportSessionActivate() ) );
};

export const supportNextBoot = () => {
	if ( ! isEnabled() ) {
		return;
	}

	localforage.bypass();

	// The following keys will not be bypassed as
	// they are safe to share across user sessions.
	const allowedKeys = [ 'debug' ];
	localStorageBypass( allowedKeys );

	// the boot is performed before the Redux store is created, so we need to wait for a promise
	reduxStoreReady.then( reduxStore => reduxStore.dispatch( supportSessionActivate() ) );
};
