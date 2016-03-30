/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Returns true if post counts request is in progress, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  postType Post type
 * @return {Boolean}          Whether request is in progress
 */
export function isRequestingPostCounts( state, siteId, postType ) {
	return get( state.posts.counts.requesting, [ siteId, postType ], false );
}

/**
 * Returns post counts for all users on a site, filtered by post type.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @return {Object}          Post counts, keyed by status
 */
export function getAllPostCounts( state, siteId, postType ) {
	return get( state.posts.counts.counts, [ siteId, postType, 'all' ], null );
}

/**
 * Returns post count for all users on a site, filtered by post type and
 * status.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @param  {String} status   Post status
 * @return {Number}          Post count
 */
export function getAllPostCount( state, siteId, postType, status ) {
	return get( getAllPostCounts( state, siteId, postType ), status, null );
}

/**
 * Returns post counts for current user on a site, filtered by post type.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @return {Object}          Post counts, keyed by status
 */
export function getMyPostCounts( state, siteId, postType ) {
	return get( state.posts.counts.counts, [ siteId, postType, 'mine' ], null );
}

/**
 * Returns post count for current user on a site, filtered by post type and
 * status.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @param  {String} status   Post status
 * @return {Number}          Post count
 */
export function getMyPostCount( state, siteId, postType, status ) {
	return get( getMyPostCounts( state, siteId, postType ), status, null );
}
