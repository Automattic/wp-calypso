/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the blog stickers for a certain site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  blogId  The ID of the site we're querying
 * @returns {Array} Blog stickers
 */
export default function getBlogStickers( state, blogId ) {
	return get( state.sites.blogStickers.items, blogId, null );
}
