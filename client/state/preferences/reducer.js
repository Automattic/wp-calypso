/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import has from 'lodash/has';
import get from 'lodash/get';
import forOwn from 'lodash/forOwn';
/**
 * Internal dependencies
 */
import {
	PREFERENCES_SET,
	PREFERENCES_RECEIVE,
	PREFERENCES_REMOVE
} from 'state/action-types';
import { USER_SETTING_KEY } from './actions';

function values( state = {}, action ) {
	if ( action.type === PREFERENCES_RECEIVE && has( action, [ 'data', USER_SETTING_KEY ] ) ) {
		state = Object.assign( {}, state, get( action, [ 'data', USER_SETTING_KEY ] ) );
		forOwn( state, ( value, key ) => {
			if ( null === value ) {
				delete state[ key ];
			}
		} );
	} else if ( action.type === PREFERENCES_SET && action.key && action.value ) {
		state = Object.assign( {}, state );
		state[ action.key ] = action.value;
	} else if ( action.type === PREFERENCES_REMOVE && action.key ) {
		state = Object.assign( {}, state );
		state[ action.key ] = null;
	}
	return state;
}

export default combineReducers( {
	values
} );
