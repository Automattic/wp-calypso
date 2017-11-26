/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { USER_PROFILE_LINKS_RECEIVE } from 'state/action-types';

export const items = createReducer( [], {
	[ USER_PROFILE_LINKS_RECEIVE ]: ( state, { profileLinks } ) => profileLinks,
} );

export default combineReducers( {
	items,
} );
