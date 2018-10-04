/** @format */

/**
 * External dependencies
 */
import { reject } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	USER_PROFILE_LINKS_ADD_DUPLICATE,
	USER_PROFILE_LINKS_ADD_FAILURE,
	USER_PROFILE_LINKS_ADD_MALFORMED,
	USER_PROFILE_LINKS_ADD_SUCCESS,
	USER_PROFILE_LINKS_DELETE_FAILURE,
	USER_PROFILE_LINKS_DELETE_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'state/action-types';

export const items = createReducer( null, {
	[ USER_PROFILE_LINKS_RECEIVE ]: ( state, { profileLinks } ) => profileLinks,
	[ USER_PROFILE_LINKS_DELETE_SUCCESS ]: ( state, { linkSlug } ) =>
		reject( state, { link_slug: linkSlug } ),
} );

export const errors = createReducer(
	{},
	{
		[ USER_PROFILE_LINKS_ADD_SUCCESS ]: () => ( {} ),
		[ USER_PROFILE_LINKS_ADD_DUPLICATE ]: ( state, { profileLinks } ) => ( {
			duplicate: profileLinks,
		} ),
		[ USER_PROFILE_LINKS_ADD_MALFORMED ]: ( state, { profileLinks } ) => ( {
			malformed: profileLinks,
		} ),
		[ USER_PROFILE_LINKS_ADD_FAILURE ]: ( state, { error } ) => ( { error } ),
		[ USER_PROFILE_LINKS_DELETE_SUCCESS ]: () => ( {} ),
		[ USER_PROFILE_LINKS_DELETE_FAILURE ]: ( state, { error } ) => ( { error } ),
		[ USER_PROFILE_LINKS_RESET_ERRORS ]: () => ( {} ),
	}
);

export default combineReducers( {
	items,
	errors,
} );
