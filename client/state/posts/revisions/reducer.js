/** @format */

/**
 * External dependencies
 */

import { keyBy, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_EDIT,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
	POST_REVISIONS_SELECT,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_DIALOG_OPEN,
	SELECTED_SITE_SET,
} from 'state/action-types';
import { combineReducers } from 'state/utils';

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_REQUEST:
		case POST_REVISIONS_REQUEST_FAILURE:
		case POST_REVISIONS_REQUEST_SUCCESS:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: action.type === POST_REVISIONS_REQUEST,
				},
			} );
	}

	return state;
}

export function revisions( state = {}, action ) {
	if ( action.type === POST_REVISIONS_RECEIVE ) {
		const { siteId, postId } = action;
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: keyBy( action.revisions, 'id' ),
			},
		};
	}

	return state;
}

export function selection( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_SELECT: {
			return { ...state, revisionId: action.revisionId };
		}
		case POST_EDIT:
		case SELECTED_SITE_SET: {
			return { ...state, revisionId: null };
		}
		default:
			return state;
	}
}

export function ui( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_DIALOG_CLOSE:
			return { ...state, isDialogVisible: false };
		case POST_REVISIONS_DIALOG_OPEN:
			return { ...state, isDialogVisible: true };
		default:
			return state;
	}
}

export default combineReducers( {
	requesting,
	revisions,
	selection,
	ui,
} );
