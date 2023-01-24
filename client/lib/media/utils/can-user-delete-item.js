/**
 * Returns true if the specified user is capable of deleting the media
 * item, or false otherwise.
 *
 * @param  {Object}  item Media item
 * @param  {Object}  user User object
 * @param  {Object}  site Site object
 * @returns {boolean}      Whether user can delete item
 */
export function canUserDeleteItem( item, user, site ) {
	if ( user.ID === item.author_ID ) {
		return site.capabilities.delete_posts;
	}

	return site.capabilities.delete_others_posts;
}
