/** @format */

/**
 * Internal dependencies
 */
import { get } from 'lodash';

/**
 * Returns the Podcasting Cover Image URL for a given site ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {string}          Cover Image URL or null if not found
 */
export function getPodcastingCoverImageUrl( state, siteId ) {
	return get( state.siteSettings.items, [ siteId, 'podcasting_image' ], null );
}

/**
 * Returns the Podcasting Cover Image ID for a given site ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Number}          Cover Image ID or null if not found
 */
export function getPodcastingCoverImageId( state, siteId ) {
	return get( state.siteSettings.items, [ siteId, 'podcasting_image_id' ], null );
}
