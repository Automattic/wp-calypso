import wpcom from 'calypso/lib/wp';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_SAVE_SUCCESS,
	PREFERENCES_SAVE_FAILURE,
} from 'calypso/state/action-types';
import { USER_SETTING_KEY } from './constants';

import 'calypso/state/preferences/init';

/**
 * Returns an action object signalling the remote preferences have been
 * received.
 *
 * @param  {Object} values Preference values
 * @returns {Object}        Action object
 */
export function receivePreferences( values ) {
	return {
		type: PREFERENCES_RECEIVE,
		values,
	};
}

/**
 * Returns an action thunk that fetches all preferences
 *
 * @returns { Function }                      Action thunk
 */
export function fetchPreferences() {
	return ( dispatch ) => {
		dispatch( { type: PREFERENCES_FETCH } );

		return wpcom.req
			.get( '/me/preferences' )
			.then( ( data ) => {
				dispatch( receivePreferences( data[ USER_SETTING_KEY ] ) );
				dispatch( { type: PREFERENCES_FETCH_SUCCESS } );
			} )
			.catch( ( data, error ) => {
				dispatch( {
					type: PREFERENCES_FETCH_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Returns an action object that is used to signal storing a user preference for the _current_ page load.
 * This is not to be confused with the `savePreference` action which will eventually store these values
 * on the setting endpoint.
 *
 * @param   {string|number}               key User preference key
 * @param   {string | number | Object | boolean | null}      value User preference value
 * @returns {Object}                        Action object
 */
export const setPreference = ( key, value ) => ( {
	type: PREFERENCES_SET,
	key,
	value,
} );

/**
 * Returns an action thunk that stores a preference and saves it to API.
 *
 * @param   {string|number}               key User preference key
 * @param   {string | number | Object | null | boolean}      value User preference value
 * @returns {(dispatch: import('calypso/state/types').CalypsoDispatch) => Promise} Action thunk
 */
export const savePreference = ( key, value ) => ( dispatch ) => {
	dispatch( setPreference( key, value ) );

	const payload = {
		[ USER_SETTING_KEY ]: {
			[ key ]: value,
		},
	};

	return wpcom.req
		.put( '/me/preferences', payload )
		.then( ( data ) => {
			dispatch( receivePreferences( data[ USER_SETTING_KEY ] ) );
			dispatch( {
				type: PREFERENCES_SAVE_SUCCESS,
				key,
				value,
			} );
		} )
		.catch( ( __, error ) => {
			dispatch( {
				type: PREFERENCES_SAVE_FAILURE,
				error,
			} );
		} );
};
