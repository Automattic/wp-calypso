/**
 * Internal dependencies
 */
import localforage from 'lib/localforage';
import {
	THEME_TRANSFER_STATUS_RECEIVE,
	AUTOMATED_TRANSFER_STATUS_SET,
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE
} from 'state/action-types';

const clearBrowserStorageAndRefresh = ( dispatch, { status } ) => {
	if ( typeof window !== 'undefined' && status === 'complete' ) {
		localStorage.clear();
		const isThemeUpload = window.location.pathname.indexOf( '/design/upload' ) === 0;
		const destination = isThemeUpload
			? window.location.pathname.split( '/upload' ).join( '' )
			: window.location.pathname;
		const goToDestination = () => window.location.href = destination;
		localforage.clear().then( goToDestination, goToDestination );
	}
};

export const handlers = {
	[ THEME_TRANSFER_STATUS_RECEIVE ]: clearBrowserStorageAndRefresh,
	[ AUTOMATED_TRANSFER_STATUS_SET ]: clearBrowserStorageAndRefresh,
	[ AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE ]: clearBrowserStorageAndRefresh
};

/**
 * Middleware
 */

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( handlers.hasOwnProperty( action.type ) ) {
		handlers[ action.type ]( dispatch, action, getState );
	}

	return next( action );
};
