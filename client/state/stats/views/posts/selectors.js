/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns `true` or `false` if views for a given site are being requested.
 *
 * @param   {Object}  state    Global state tree
 * @param   {Number}  siteId   Site ID
 * @returns {boolean}          Whether or not views are being requested for site.
 */
export function isRequestingViewsForSite( state, siteId ) {
	return !! state.stats.views.requesting[ siteId ];
}

/**
 * Returns `true` or `false` if views for a given post are being requested.
 *
 * @param   {Object}  state    Global state tree
 * @param   {Number}  siteId   Site ID
 * @param   {Number}  postId   Post ID
 * @returns {boolean}          Whether or not views are being requested for post.
 */
export function isRequestingViewsForPost( state, siteId, postId ) {
	return !! get( state, [ 'stats', 'views', 'requesting', siteId, postId ], false );
}

/**
 * Returns the number of views for a given post, or `null`.
 *
 * @param   {Object}  state    Global state tree
 * @param   {Number}  siteId   Site ID
 * @param   {Number}  postId   Post ID
 * @returns {?String}          Post views.
 */
export function getViewsForPost( state, siteId, postId ) {
	return get( state, [ 'stats', 'views', 'items', siteId, postId, 'views' ], null );
}
