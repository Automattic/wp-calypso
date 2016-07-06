/**
 * External dependencies
 */

 import map from 'lodash/map';

/**
 * Internal dependencies
 */
import createSelector from 'lib/createSelector';

export function isRequestingDiscoveryPosts( state ) {
	return !! state.reader.discover.isRequestingDiscoveryPosts;
}

export function getDiscoverPosts( state ) {
	return state.reader.discover.items;
}

export const getDiscoverPostIds = createSelector(
	( state ) => map( state.reader.discover.items, 'ID' ),
	( state ) => [ state.reader.discover.items ]
);
