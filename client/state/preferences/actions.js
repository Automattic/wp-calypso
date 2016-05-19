/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_REMOVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	PREFERENCES_FETCH_FAILURE
} from 'state/action-types';

export const USER_SETTING_KEY = 'calypso_preferences';

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

const save = () => ( dispatch, getState ) => {
	const settings = {};
	settings[ USER_SETTING_KEY ] = getState().preferences.values;
	wpcom.me().settings().update( JSON.stringify( settings ) ).then( ( data ) => {
		dispatch( {
			type: PREFERENCES_RECEIVE,
			data
		} );
	} );
};

export const setPreference = ( key, value ) => ( dispatch, getState ) => {
	dispatch( {
		type: PREFERENCES_SET,
		key,
		value
	} );
	save()( dispatch, getState );
};

export const removePreference = ( key ) => ( dispatch, getState ) => {
	dispatch( {
		type: PREFERENCES_REMOVE,
		key
	} );
	save()( dispatch, getState );
};
