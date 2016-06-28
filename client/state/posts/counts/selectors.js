/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Constants
 */
const POST_STATUSES = [ 'publish', 'draft', 'pending', 'private', 'future', 'trash' ];

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

/**
 * Returns an object of normalized post counts, summing publish/private and
 * pending/draft counts.
 *
 * @param  {Object}   state         Global state tree
 * @param  {Number}   siteId        Site ID
 * @param  {String}   postType      Post type
 * @param  {Function} countSelector Selector from which to retrieve raw counts
 * @return {Number}                 Normalized post counts
 */
export function getNormalizedPostCounts( state, siteId, postType, countSelector = getAllPostCounts ) {
	const counts = countSelector( state, siteId, postType );

	return POST_STATUSES.reduce( ( memo, status ) => {
		const count = get( counts, status, 0 );

		let key;
		switch ( status ) {
			case 'publish':
			case 'private':
				key = 'publish';
				break;

			case 'draft':
			case 'pending':
				key = 'draft';
				break;

			default:
				key = status;
		}

		return {
			...memo,
			[ key ]: ( memo[ key ] || 0 ) + count
		};
	}, {} );
}

/**
 * Returns an object of normalized post counts for current user, summing
 * publish/private and pending/draft counts.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} postType Post type
 * @return {Number}          Normalized post counts
 */
export function getNormalizedMyPostCounts( state, siteId, postType ) {
	return getNormalizedPostCounts( state, siteId, postType, getMyPostCounts );
}
