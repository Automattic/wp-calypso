/**
 * External dependencies
 */
import { reject } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import {
	USER_PROFILE_LINKS_ADD_DUPLICATE,
	USER_PROFILE_LINKS_ADD_FAILURE,
	USER_PROFILE_LINKS_ADD_MALFORMED,
	USER_PROFILE_LINKS_ADD_SUCCESS,
	USER_PROFILE_LINKS_DELETE_FAILURE,
	USER_PROFILE_LINKS_DELETE_SUCCESS,
	USER_PROFILE_LINKS_RECEIVE,
	USER_PROFILE_LINKS_RESET_ERRORS,
} from 'calypso/state/action-types';

export const items = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case USER_PROFILE_LINKS_RECEIVE: {
			const { profileLinks } = action;
			return profileLinks;
		}
		case USER_PROFILE_LINKS_DELETE_SUCCESS: {
			const { linkSlug } = action;
			return reject( state, { link_slug: linkSlug } );
		}
	}

	return state;
} );

export const errors = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_PROFILE_LINKS_ADD_SUCCESS:
			return {};
		case USER_PROFILE_LINKS_ADD_DUPLICATE: {
			const { profileLinks } = action;

			return {
				duplicate: profileLinks,
			};
		}
		case USER_PROFILE_LINKS_ADD_MALFORMED: {
			const { profileLinks } = action;

			return {
				malformed: profileLinks,
			};
		}
		case USER_PROFILE_LINKS_ADD_FAILURE: {
			const { error } = action;
			return { error };
		}
		case USER_PROFILE_LINKS_DELETE_SUCCESS:
			return {};
		case USER_PROFILE_LINKS_DELETE_FAILURE: {
			const { error } = action;
			return { error };
		}
		case USER_PROFILE_LINKS_RESET_ERRORS:
			return {};
	}

	return state;
} );

export default combineReducers( {
	items,
	errors,
} );
