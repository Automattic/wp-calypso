/**
 * Internal dependencies
 */
import { getSerializedQuery } from 'state/followers/utils';
/**
 * Returns a list of followers for the given Query.
 *
 * @param  {Object} state Global state tree
 * @param  {Object} query Query paramaters by which the followers were fetched
 * @return {Object}       List of followers keyed by follower id
 */
export function getFollowersForQuery( state, query ) {
	const serializedQuery = getSerializedQuery( query );
	if ( ! state.followers.queries[ serializedQuery ] ) {
		return null;
	}
	return state.followers.queries[ serializedQuery ].map( ( Id ) => {
		return state.followers.items[ Id ];
	} ).filter( Boolean );
}
