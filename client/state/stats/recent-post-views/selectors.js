/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the number of views for a given post, or `null`.
 *
 * @param   {object}  state    Global state tree
 * @param   {Number}  siteId   Site ID
 * @param   {Number}  postId   Post ID
 * @returns {?string}          Post views.
 */
export function getRecentViewsForPost( state, siteId, postId ) {
	return get( state, [ 'stats', 'recentPostViews', 'items', siteId, postId, 'views' ], null );
}
