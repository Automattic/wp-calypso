/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE,
	PREFERENCES_SAVE,
	PREFERENCES_SAVE_FAILURE,
	PREFERENCES_SAVE_SUCCESS,
} from 'state/action-types';
import { USER_SETTING_KEY } from './constants';

/**
 * Returns an action object signalling the remote preferences have been
 * received.
 *
 * @param  {object} values Preference values
 * @returns {object}        Action object
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

		return wpcom
			.undocumented()
			.me()
			.preferences()
			.get()
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
 * @param   {string|number|object}      value User preference value
 * @returns {object}                        Action object
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
 * @param   {string|number|object}      value User preference value
 * @returns { Function }                      Action thunk
 */
export const savePreference = ( key, value ) => ( dispatch ) => {
	dispatch( setPreference( key, value ) );
	dispatch( {
		type: PREFERENCES_SAVE,
		key,
		value,
	} );

	const payload = {
		[ USER_SETTING_KEY ]: {
			[ key ]: value,
		},
	};

	return wpcom
		.undocumented()
		.me()
		.preferences()
		.update( payload )
		.then( ( data ) => {
			dispatch( receivePreferences( data[ USER_SETTING_KEY ] ) );
			dispatch( {
				type: PREFERENCES_SAVE_SUCCESS,
				key,
				value,
			} );
		} )
		.catch( ( error ) => {
			dispatch( {
				type: PREFERENCES_SAVE_FAILURE,
				error,
			} );
		} );
};
