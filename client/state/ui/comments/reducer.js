/** @format */
/**
 * External dependencies
 */
import { get, includes, isUndefined, map, pickBy, without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_PROGRESS_UPDATE,
	COMMENTS_QUERY_UPDATE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';
import { getFiltersKey } from 'state/ui/comments/utils';

const deepUpdateComments = ( state, comments, query ) => {
	const { page = 1, postId } = query;
	const parent = postId || 'site';
	const filter = getFiltersKey( query );

	const parentObject = get( state, parent, {} );
	const filterObject = get( parentObject, filter, {} );

	return {
		...state,
		[ parent ]: {
			...parentObject,
			[ filter ]: {
				...filterObject,
				[ page ]: comments,
			},
		},
	};
};

export const queries = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
		case COMMENTS_DELETE:
			if ( ! action.refreshCommentListQuery ) {
				return state;
			}
			const { page, postId, status } = action.refreshCommentListQuery;
			if (
				COMMENTS_CHANGE_STATUS === action.type &&
				'all' === status &&
				includes( [ 'approved', 'unapproved' ], action.status )
			) {
				// No-op when status changes from `approved` or `unapproved` in the All tab
				return state;
			}

			const parent = postId || 'site';
			const filter = getFiltersKey( action.refreshCommentListQuery );

			const comments = get( state, [ parent, filter, page ] );

			return deepUpdateComments(
				state,
				without( comments, action.commentId ),
				action.refreshCommentListQuery
			);
		case COMMENTS_QUERY_UPDATE:
			return isUndefined( get( action, 'query.page' ) )
				? state
				: deepUpdateComments( state, map( action.comments, 'ID' ), action.query );
		default:
			return state;
	}
};

const clearCompletedProgresses = state => pickBy( state, ( { count, total } ) => count !== total );

export const progresses = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
		case COMMENTS_DELETE:
			const { refreshCommentListQuery: query, status } = action;
			if ( ! query || ! query.progressId ) {
				return state;
			}
			const { progressId, progressTotal } = query;
			return {
				...clearCompletedProgresses( state ),
				[ progressId ]: {
					count: 0,
					failed: false,
					status: status || 'delete',
					total: progressTotal || 1,
				},
			};
		case COMMENTS_PROGRESS_UPDATE:
			const progress = state[ action.progressId ];
			if ( ! progress ) {
				return state;
			}
			return {
				...clearCompletedProgresses( state ),
				[ action.progressId ]: {
					...progress,
					count: progress.count + 1,
					failed: progress.failed ? true : action.failed,
				},
			};
		default:
			return state;
	}
};

export default combineReducers( {
	progresses: keyedReducer( 'siteId', progresses ),
	queries: keyedReducer( 'siteId', queries ),
} );
