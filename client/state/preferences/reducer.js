/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import get from 'lodash/get';
import forOwn from 'lodash/forOwn';
/**
 * Internal dependencies
 */
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_REMOVE,
	PREFERENCES_FETCH,
	PREFERENCES_FETCH_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { USER_SETTING_KEY } from './actions';

function values( state = {}, action ) {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
		case PREFERENCES_RECEIVE:
			state = Object.assign( {}, state, get( action, [ 'data', USER_SETTING_KEY ], {} ) );
			forOwn( state, ( value, key ) => {
				if ( null === value ) {
					delete state[ key ];
				}
			} );
			return state;
		case PREFERENCES_SET:
			state = Object.assign( {}, state );
			state[ action.key ] = action.value;
			return state;
		case PREFERENCES_REMOVE:
			state = Object.assign( {}, state );
			state[ action.key ] = null;
			return state;
	}
	return state;
}

function fetching( state = false, action ) {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
			return false;
		case PREFERENCES_FETCH:
			return true;
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}
	return state;
}

export default combineReducers( {
	values,
	fetching
} );
