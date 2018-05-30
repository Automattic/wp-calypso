/** @format */

/**
 * Internal dependencies
 */
import { get } from 'lodash';

/**
 * Returns whether or not the site has a blog "enabled" in Settings > Writing.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         Whether or not blogging is "enabled".
 */
export default function isBlogEnabled( state, siteId ) {
	return get( state.siteSettings.items, [ siteId, 'blog_enabled' ], true );
}
