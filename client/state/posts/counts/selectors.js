import { get } from 'lodash';

import 'calypso/state/posts/init';

/**
 * Returns true if post counts request is in progress, or false otherwise.
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  postType Post type
 * @returns {boolean}          Whether request is in progress
 */
export function isRequestingPostCounts( state, siteId, postType ) {
	return get( state.posts.counts.requesting, [ siteId, postType ], false );
}

/**
 * Returns post counts for all users on a site, filtered by post type.
 * @param  {Object} state    Global state tree
 * @param  {number|undefined} siteId   Site ID
 * @param  {string} postType Post type
 * @returns {Record<string, number>}          Post counts, keyed by status
 */
export function getAllPostCounts( state, siteId, postType ) {
	return get( state.posts.counts.counts, [ siteId, postType, 'all' ], null );
}

/**
 * Returns post count for all users on a site, filtered by post type and
 * status.
 * @param  {Object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @param  {string} postType Post type
 * @param  {string} status   Post status
 * @returns {number}          Post count
 */
export function getAllPostCount( state, siteId, postType, status ) {
	const counts = getAllPostCounts( state, siteId, postType );
	if ( ! counts ) {
		return null;
	}

	return counts[ status ] || 0;
}

/**
 * Returns post counts for current user on a site, filtered by post type.
 * @param  {Object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @param  {string} postType Post type
 * @returns {Object}          Post counts, keyed by status
 */
export function getMyPostCounts( state, siteId, postType ) {
	return get( state.posts.counts.counts, [ siteId, postType, 'mine' ], null );
}
