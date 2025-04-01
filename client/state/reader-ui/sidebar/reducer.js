import {
	READER_SIDEBAR_LISTS_TOGGLE,
	READER_SIDEBAR_TAGS_TOGGLE,
	READER_SIDEBAR_ORGANIZATIONS_TOGGLE,
	READER_SIDEBAR_FOLLOWING_TOGGLE,
	READER_SIDEBAR_SELECT_RECENT_SITE,
} from 'calypso/state/reader-ui/action-types';
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
			const orgId = action.organizationId;
			return state.includes( orgId ) ? state.filter( ( id ) => id !== orgId ) : [ ...state, orgId ];
		}
	}

	return state;
} );

export const selectedRecentSite = ( state = null, action ) => {
	switch ( action.type ) {
		case READER_SIDEBAR_SELECT_RECENT_SITE:
			return action.feedId;
	}

	return state;
};

export default combineReducers( {
	isListsOpen,
	isTagsOpen,
	isFollowingOpen,
	openOrganizations,
	selectedRecentSite,
} );
