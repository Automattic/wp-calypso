/** @format */
/**
 * External dependencies
 */
import { get, isUndefined, map } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_PER_PAGE } from 'my-sites/comments/constants';
import { COMMENTS_QUERY_UPDATE } from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

const deepUpdateComments = ( state, comments, { offset, postId, status } ) => {
	const parent = postId || 'site';
	const pageNumber = offset / COMMENTS_PER_PAGE + 1;
	const commentIds = map( comments, 'ID' );

	const parentObject = get( state, parent, {} );
	const statusObject = get( parentObject, status, {} );

	return {
		...state,
		[ parent ]: {
			...parentObject,
			[ status ]: {
				...statusObject,
				[ pageNumber ]: commentIds,
			},
		},
	};
};

const queries = ( state = {}, action ) => {
	if ( isUndefined( get( action, 'query.offset' ) ) ) {
		return state;
	}
	switch ( action.type ) {
		case COMMENTS_QUERY_UPDATE:
			return deepUpdateComments( state, action.comments, action.query );
		default:
			return state;
	}
};

export default combineReducers( { queries: keyedReducer( 'siteId', queries ) } );
