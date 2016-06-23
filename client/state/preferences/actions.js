/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE
} from 'state/action-types';
import { USER_SETTING_KEY } from './constants';

/**
 * Returns an action thunk that fetches all preferences
 * @returns { Function }                      Action thunk
 */
export function fetchPreferences() {
	return ( dispatch ) => {
		dispatch( { type: PREFERENCES_FETCH } );
		return wpcom.me().settings().get()
		.then( data => dispatch( {
			type: PREFERENCES_FETCH_SUCCESS,
			data
		} ) )
		.catch( ( data, error ) => dispatch( {
			type: PREFERENCES_FETCH_FAILURE,
			data,
			error
		} ) );
	};
}

/**
 * Returns an action object that is used to signal storing a user preference for the _current_ page load.
 * This is not to be confused with the `savePreference` action which will eventually store these values
 * on the setting endpoint.
 * @param   { String | Number }               key User preference key
 * @param   { String | Number | Object }      value User preference value
 * @returns { Object }                        Action object
 */
export const setPreference = ( key, value ) => ( {
	type: PREFERENCES_SET,
	key,
	value
} );

/**
 * Returns an action thunk that stores a preference and saves it to API.
 * @param   { String | Number }               key User preference key
 * @param   { String | Number | Object }      value User preference value
 * @returns { Function }                      Action thunk
 */
export const savePreference = ( key, value ) => dispatch => {
	dispatch( setPreference( key, value ) );
	const settings = {
		[ USER_SETTING_KEY ]: {
			[ key ]: value
		}
	};

	return wpcom.me().settings().update( JSON.stringify( settings ) )
		.then( ( data ) => {
			dispatch( {
				type: PREFERENCES_RECEIVE,
				data
			} );
		} );
};
