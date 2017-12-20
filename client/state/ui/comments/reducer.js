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

const deepUpdateComments = ( state, comments, { offset = 0, postId, search, status = 'all' } ) => {
	const parent = postId || 'site';
	const filter = !! search ? `${ status }?s=${ search }` : status;
	const pageNumber = offset / COMMENTS_PER_PAGE + 1;
	const commentIds = map( comments, 'ID' );

	const parentObject = get( state, parent, {} );
	const filterObject = get( parentObject, filter, {} );

	return {
		...state,
		[ parent ]: {
			...parentObject,
			[ filter ]: {
				...filterObject,
				[ pageNumber ]: commentIds,
			},
		},
	};
};

export const queries = ( state = {}, action ) => {
	if ( isUndefined( get( action, 'query.offset' ) ) ) {
		return state;
	}
	const { comments, type, query } = action;
	switch ( type ) {
		case COMMENTS_QUERY_UPDATE:
			return deepUpdateComments( state, comments, query );
		default:
			return state;
	}
};

export default combineReducers( { queries: keyedReducer( 'siteId', queries ) } );
