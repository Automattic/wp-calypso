/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/stats/init';

/**
 * Returns the number of views for a given post, or `null`.
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {number}  postId   Post ID
 * @returns {?string}          Post views.
 */
export function getRecentViewsForPost( state, siteId, postId ) {
	return get( state, [ 'stats', 'recentPostViews', 'items', siteId, postId, 'views' ], null );
}
