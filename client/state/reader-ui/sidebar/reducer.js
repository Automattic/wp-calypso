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
import { combineReducers } from 'calypso/state/utils';
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';

export const isListsOpen = ( state = false, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case DESERIALIZE:
			return state;

		case READER_SIDEBAR_LISTS_TOGGLE:
			return ! state;
	}

	return state;
};
isListsOpen.hasCustomPersistence = true;

export const isTagsOpen = ( state = false, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case DESERIALIZE:
			return state;

		case READER_SIDEBAR_TAGS_TOGGLE:
			return ! state;
	}

	return state;
};
isTagsOpen.hasCustomPersistence = true;

export const isFollowingOpen = ( state = false, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case DESERIALIZE:
			return state;

		case READER_SIDEBAR_FOLLOWING_TOGGLE:
			return ! state;
	}

	return state;
};
isFollowingOpen.hasCustomPersistence = true;

export const openOrganizations = ( state = [], action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case DESERIALIZE:
			return state;

		case READER_SIDEBAR_ORGANIZATIONS_TOGGLE: {
			return xor( state, [ action.organizationId ] );
		}
	}

	return state;
};
openOrganizations.hasCustomPersistence = true;

export default combineReducers( {
	isListsOpen,
	isTagsOpen,
	isFollowingOpen,
	openOrganizations,
} );
