/** @format */
/**
 * External dependencies
 */
import { get, includes, isUndefined, map, without } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_CHANGE_STATUS, COMMENTS_DELETE, COMMENTS_QUERY_UPDATE } from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

const deepUpdateComments = ( state, comments, { page = 1, postId, search, status = 'all' } ) => {
	const parent = postId || 'site';
	const filter = !! search ? `${ status }?s=${ search }` : status;

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
			const { page, postId, search, status } = action.refreshCommentListQuery;
			if (
				COMMENTS_CHANGE_STATUS === action.type &&
				'all' === status &&
				includes( [ 'approved', 'unapproved' ], action.status )
			) {
				// No-op when status changes from `approved` or `unapproved` in the All tab
				return state;
			}

			const parent = postId || 'site';
			const filter = !! search ? `${ status }?s=${ search }` : status;

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

export default combineReducers( { queries: keyedReducer( 'siteId', queries ) } );
