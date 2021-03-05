/**
 * External dependencies
 */
import { xor } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_SIDEBAR_LISTS_TOGGLE,
	READER_SIDEBAR_TAGS_TOGGLE,
	READER_SIDEBAR_ORGANIZATIONS_TOGGLE,
	READER_SIDEBAR_FOLLOWING_TOGGLE,
} from 'calypso/state/reader/action-types';
import { combineReducers, withPersistence } from 'calypso/state/utils';

export const isListsOpen = withPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case READER_SIDEBAR_LISTS_TOGGLE:
			return ! state;
	}

	return state;
} );

export const isTagsOpen = withPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case READER_SIDEBAR_TAGS_TOGGLE:
			return ! state;
	}

	return state;
} );

export const isFollowingOpen = withPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case READER_SIDEBAR_FOLLOWING_TOGGLE:
			return ! state;
	}

	return state;
} );

export const openOrganizations = withPersistence( ( state = [], action ) => {
	switch ( action.type ) {
		case READER_SIDEBAR_ORGANIZATIONS_TOGGLE: {
			return xor( state, [ action.organizationId ] );
		}
	}

	return state;
} );

export default combineReducers( {
	isListsOpen,
	isTagsOpen,
	isFollowingOpen,
	openOrganizations,
} );
