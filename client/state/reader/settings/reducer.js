/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	PREFERENCES_FETCH_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { READER_USER_SETTING_KEY } from './constants';

/**
 * Returns the current user's Reader settings. These come from the reader key on /me/settings.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case PREFERENCES_FETCH_SUCCESS:
			return action.data[ READER_USER_SETTING_KEY ]; // @todo add schema validation

		case SERIALIZE:
		case DESERIALIZE:
			return null;
	}

	return state;
}

export default combineReducers( {
	items,
} );
