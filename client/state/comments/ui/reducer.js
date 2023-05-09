import { get, includes, map, without } from 'lodash';
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_LIST_REQUEST,
	COMMENTS_QUERY_UPDATE,
} from 'calypso/state/action-types';
import { getFiltersKey } from 'calypso/state/comments/ui/utils';
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

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

const sortDescending = function ( a, b ) {
	if ( a < b ) {
		return 1;
	}
	if ( a > b ) {
		return -1;
	}
	return 0;
};

const sortAscending = function ( a, b ) {
	if ( a < b ) {
		return -1;
	}
	if ( a > b ) {
		return 1;
	}
	return 0;
};

export const queries = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
		case COMMENTS_DELETE: {
			const query = action.refreshCommentListQuery;
			if ( ! query ) {
				return state;
			}
			const { page, postId, status } = query;
			const parent = postId || 'site';
			const filter = getFiltersKey( query );
			const comments = get( state, [ parent, filter, page ] );

			if (
				COMMENTS_CHANGE_STATUS === action.type &&
				'all' === status &&
				includes( comments, action.commentId ) && // if the comment is not in the current view this is an undo
				[ 'approved', 'unapproved' ].includes( action.status )
			) {
				// No-op when status changes from `approved` or `unapproved` in the All tab
				return state;
			}

			if (
				status === action.status ||
				( status === 'all' && [ 'approved', 'unapproved' ].includes( action.status ) )
			) {
				//with undo, we should add this back to the list
				const sortedList = [ action.commentId ]
					.concat( comments )
					.sort( query.order === 'DESC' ? sortDescending : sortAscending );
				return deepUpdateComments( state, sortedList, query );
			}
			return deepUpdateComments( state, without( comments, action.commentId ), query );
		}
		case COMMENTS_QUERY_UPDATE:
			return typeof get( action, 'query.page' ) === 'undefined'
				? state
				: deepUpdateComments( state, map( action.comments, 'ID' ), action.query );
		default:
			return state;
	}
};

export const pendingActions = function ( state = [], action ) {
	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
		case COMMENTS_DELETE: {
			const key = getRequestKey( action );
			if ( action.meta?.dataLayer?.trackRequest && ! state.includes( key ) ) {
				return [ ...state, key ];
			}
			return state;
		}
		case COMMENTS_LIST_REQUEST:
			//ignore pending requests if we're looking at a fresh view
			return [];
		default:
			return state;
	}
};

export default combineReducers( {
	queries: keyedReducer( 'siteId', queries ),
	pendingActions,
} );
