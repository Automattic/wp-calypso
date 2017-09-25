/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { GOOGLE_APPS_USERS_FETCH, GOOGLE_APPS_USERS_FETCH_COMPLETED, GOOGLE_APPS_USERS_FETCH_FAILED } from 'state/action-types';
import { combineReducers } from 'state/utils';

export function items( state = [], action ) {
	switch ( action.type ) {
		case GOOGLE_APPS_USERS_FETCH_COMPLETED:
			return uniqBy( state.concat( action.items ), 'email' );
	}
	return state;
}

export function loaded( state = false, action ) {
	switch ( action.type ) {
		case GOOGLE_APPS_USERS_FETCH:
			return false;
		case GOOGLE_APPS_USERS_FETCH_FAILED:
		case GOOGLE_APPS_USERS_FETCH_COMPLETED:
			return true;
	}
	return state;
}

export default combineReducers( {
	items,
	loaded
} );
