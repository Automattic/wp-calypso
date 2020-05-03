/**
 * External dependencies
 */

import { filter, get, isEmpty, isInteger, keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_EDIT,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_SELECT,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_DIALOG_OPEN,
	POST_REVISIONS_DIFF_SPLIT_VIEW,
	POST_REVISIONS_DIFF_UNIFY_VIEW,
	SELECTED_SITE_SET,
} from 'state/action-types';
import authors from './authors/reducer';
import { combineReducers } from 'state/utils';

export function diffs( state = {}, { diffs: diffsFromServer, postId, revisions, siteId, type } ) {
	if ( type !== POST_REVISIONS_RECEIVE ) {
		return state;
	}
	if ( ! isInteger( siteId ) || siteId <= 0 ) {
		return state;
	}

	const sitePostState = get( state, [ siteId, postId ], {} );
	const mergedRevisions = {
		...get( sitePostState, 'revisions', {} ),
		...revisions,
	};

	const filteredDiffs = filter( diffsFromServer, ( { diff, from, to } ) => {
		if ( ! isInteger( from ) || from < 0 ) {
			// `from` can be zero
			return false;
		}
		if ( ! isInteger( to ) || to < 1 ) {
			// `to` cannot be zero
			return false;
		}

		// Ensure fresh revisions were provided for `from` and `to` in the payload
		if ( from !== 0 && isEmpty( mergedRevisions[ from ] ) ) {
			// if `from` is `0`, there won't be a revision to validate
			return false;
		}
		if ( isEmpty( mergedRevisions[ to ] ) ) {
			return false;
		}

		return ! isEmpty( diff );
	} );

	if ( isEmpty( filteredDiffs ) ) {
		return state;
	}

	return {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ postId ]: {
				...{
					...omit( sitePostState, 'revisions' ),
					...keyBy( filteredDiffs, ( d ) => `${ d.from }:${ d.to }` ),
				},
				revisions: mergedRevisions,
			},
		},
	};
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
		case POST_REVISIONS_DIFF_SPLIT_VIEW:
			return { ...state, diffView: 'split' };
		case POST_REVISIONS_DIFF_UNIFY_VIEW:
			return { ...state, diffView: 'unified' };
		default:
			return state;
	}
}

export default combineReducers( {
	diffs,
	selection,
	ui,
	authors,
} );
