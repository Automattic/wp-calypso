/**
 * Internal dependencies
 */

import {
	READER_SIDEBAR_LISTS_TOGGLE,
	READER_SIDEBAR_TAGS_TOGGLE,
	READER_SIDEBAR_ORGANIZATIONS_TOGGLE,
	READER_SIDEBAR_FOLLOWING_TOGGLE,
} from 'state/reader/action-types';
import { combineReducers } from 'state/utils';

export function isListsOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_LISTS_TOGGLE:
			return ! state;
	}

	return state;
}

export function isTagsOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_TAGS_TOGGLE:
			return ! state;
	}

	return state;
}

export function isFollowingOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_FOLLOWING_TOGGLE:
			return ! state;
	}

	return state;
}

export function openOrganizations( state = [], action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_ORGANIZATIONS_TOGGLE: {
			const opened = state;
			const index = opened.indexOf( action.organizationId );

			if ( index > -1 ) {
				opened.splice( index, 1 );
			} else {
				opened.push( action.organizationId );
			}
			return [ ...opened ];
		}
	}

	return state;
}

export default combineReducers( {
	isListsOpen,
	isTagsOpen,
	isFollowingOpen,
	openOrganizations,
} );
