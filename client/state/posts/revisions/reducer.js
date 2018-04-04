/** @format */

/**
 * External dependencies
 */

import { filter, get, isEmpty, isInteger, keyBy, merge, omit } from 'lodash';

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

export function diffs( state = {}, { diffs: diffsFromServer, postId, revisions, siteId, type } ) {
	if ( ! isInteger( siteId ) || siteId <= 0 ) {
		return state;
	}

	if ( type !== 'POST_REVISIONS_LOAD_PENDING' && type !== POST_REVISIONS_RECEIVE ) {
		return state;
	}

	// general for both
	const sitePostState = get( state, [ siteId, postId ], {} );
	const previousRevisions = get( sitePostState, 'revisions', {} );

	if ( type === 'POST_REVISIONS_LOAD_PENDING' ) {
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: {
					...get( sitePostState, 'pending.diffs', {} ),
					revisions: get( sitePostState, 'pending.revisions', {} ),
					pending: {},
				},
			},
		};
	}

	if ( type === POST_REVISIONS_RECEIVE ) {
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

		const keyedDiffs = keyBy( filteredDiffs, d => `${ d.from }:${ d.to }` );

		if ( ! isEmpty( previousRevisions ) ) {
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: {
						// return previous sitePostState as-is, updating only the pending values
						...sitePostState,
						pending: {
							count: length,
							diffs: keyedDiffs,
							revisions: mergedRevisions,
						},
					},
				},
			};
		}

		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: {
					...{
						...omit( sitePostState, [ 'revisions', 'pending' ] ),
						...keyedDiffs,
					},
					revisions: mergedRevisions,
					pending: {},
				},
			},
		};
	}

	return state;
}

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
	diffs,
	requesting,
	selection,
	ui,
} );
