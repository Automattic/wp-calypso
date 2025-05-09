import { filter, get, isEmpty, keyBy, omit } from 'lodash';
import {
	POST_EDIT,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_SELECT,
	POST_REVISIONS_DIALOG_CLOSE,
	SELECTED_SITE_SET,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import authors from './authors/reducer';

export function diffs(
	state = {},
	{ diffs: diffsFromServer, postId, revisions, revision_fields, siteId, type }
) {
	if ( type !== POST_REVISIONS_RECEIVE ) {
		return state;
	}
	if ( ! Number.isInteger( siteId ) || siteId <= 0 ) {
		return state;
	}

	const sitePostState = get( state, [ siteId, postId ], {} );
	const mergedRevisions = {
		...get( sitePostState, 'revisions', {} ),
		...revisions,
	};

	const filteredDiffs = filter( diffsFromServer, ( { diff, from, to } ) => {
		if ( ! Number.isInteger( from ) || from < 0 ) {
			// `from` can be zero
			return false;
		}
		if ( ! Number.isInteger( to ) || to < 1 ) {
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
				revisionFields: revision_fields,
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
