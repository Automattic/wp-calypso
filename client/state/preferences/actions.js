/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_REMOVE
} from 'state/action-types';

export const USER_SETTING_KEY = 'calypso_preferences';

export function fetch() {
	return ( dispatch ) => {
		return wpcom.me().settings().get().then( ( data ) => {
			dispatch( {
				type: PREFERENCES_RECEIVE,
				data
			} );
		} );
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

export const set = ( key, value ) => ( dispatch, getState ) => {
	dispatch( {
		type: PREFERENCES_SET,
		key,
		value
	} );
	save()( dispatch, getState );
};

export const remove = ( key ) => ( dispatch, getState ) => {
	dispatch( {
		type: PREFERENCES_REMOVE,
		key
	} );
	save()( dispatch, getState );
};
