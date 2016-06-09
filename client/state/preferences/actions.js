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
 * Create action thunk for updating preference value and saving it in API
 * @param key
 * @param value
 */
export const setPreference = ( key, value ) => dispatch => {
	dispatch( {
		type: PREFERENCES_SET,
		key,
		value
	} );
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
