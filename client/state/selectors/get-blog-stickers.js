/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the blog stickers for a certain site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  blogId  The ID of the site we're querying
 * @return {Array} Blog stickers
 */
export default function getBlogStickers( state, blogId ) {
	return get( state.sites.blogStickers.items, blogId, null );
}
