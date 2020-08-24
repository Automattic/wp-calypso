/**
 * Returns true if the specified user is capable of deleting the media
 * item, or false otherwise.
 *
 * @param  {object}  item Media item
 * @param  {object}  user User object
 * @param  {object}  site Site object
 * @returns {boolean}      Whether user can delete item
 */
export function canUserDeleteItem( item, user, site ) {
	if ( user.ID === item.author_ID ) {
		return site.capabilities.delete_posts;
	}

	return site.capabilities.delete_others_posts;
}
