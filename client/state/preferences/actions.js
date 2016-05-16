/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {} from 'state/action-types';

export function fetch() {
	return ( dispatch ) => {
		return wpcom.me().settings().get().then( ( data ) => {
			dispatch( {
				type: 'PREFERENCES_RECEIVE',
				data
			} );
		} );
	};
}

export function set( key, value ) {
	return {
		type: 'PREFERENCES_SET',
		key,
		value
	};
}

export function remove( key ) {
	return {
		type: 'PREFERENCES_REMOVE',
		key
	};
}

export function save() {
	return ( dispatch, getState ) => {
		const settings = {};
		settings[ 'calypso_preferences' ] = getState().preferences.values;
		wpcom.me().settings().update( JSON.stringify( settings ) ).then( ( data ) => {
			dispatch( {
				type: 'PREFERENCES_RECEIVE',
				data
			} );
		} );
	};
}
