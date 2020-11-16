/**
 * Internal dependencies
 */

import { getSerializedQuery } from 'calypso/state/followers/utils';
/**
 * Returns a list of followers for the given Query.
 *
 * @param  {object} state Global state tree
 * @param  {object} query Query paramaters by which the followers were fetched
 * @returns {object}       List of followers keyed by follower id
 */
export function getFollowersForQuery( state, query ) {
	const serializedQuery = getSerializedQuery( query );
	if ( ! state.followers.queries[ serializedQuery ] ) {
		return null;
	}
	return state.followers.queries[ serializedQuery ]
		.map( ( Id ) => {
			return state.followers.items[ Id ];
		} )
		.filter( Boolean );
}

export const getFollowersByQuery = ( state, query ) => {
	const serializedQuery = getSerializedQuery( query );
	return (
		state.followers?.queries[ serializedQuery ]?.ids.map(
			( id ) => state.followers?.items[ id ]
		) ?? []
	);
};

export const getIsFetchingFollowersForQuery = ( state, query ) => {
	const serializedQuery = getSerializedQuery( query );
	return state.followers?.queryRequests[ serializedQuery ];
};

export const getTotalFollowersByQuery = ( state, query ) => {
	const serializedQuery = getSerializedQuery( query );
	return state.followers?.queries[ serializedQuery ]?.total;
};
