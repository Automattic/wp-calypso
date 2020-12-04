/**
 * Internal dependencies
 */

import { getSerializedQuery } from 'calypso/state/followers/utils';

import 'calypso/state/followers/init';

/**
 * Returns a list of followers for the given Query.
 *
 * @param  {object} state Global state tree
 * @param  {object} query Query paramaters by which the followers were fetched
 * @returns {object}       List of followers keyed by follower id
 */
export const getFollowersForQuery = ( state, query ) => {
	const serializedQuery = getSerializedQuery( query );
	return (
		state.followers?.queries[ serializedQuery ]?.ids.map(
			( id ) => state.followers?.items[ id ]
		) ?? []
	);
};

export const isFetchingFollowersForQuery = ( state, query ) => {
	const serializedQuery = getSerializedQuery( query );
	return state.followers?.queryRequests[ serializedQuery ] ?? false;
};

export const getTotalFollowersForQuery = ( state, query ) => {
	const serializedQuery = getSerializedQuery( query );
	return state.followers?.queries[ serializedQuery ]?.total;
};
