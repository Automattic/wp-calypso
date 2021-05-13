/**
 * Returns the ID of the featured image assigned to the specified post, or
 * `undefined` otherwise. A utility function is useful because the format
 * of a post varies between the retrieve and update endpoints. When
 * retrieving a post, the thumbnail ID is assigned in `post_thumbnail`, but
 * in creating a post, the thumbnail ID is assigned to `featured_image`.
 *
 * @param  {object} post Post object
 * @returns {*} featured image id or undefined
 */
export function getFeaturedImageId( post ) {
	if ( ! post ) {
		return;
	}

	if ( 'featured_image' in post && ! /^https?:\/\//.test( post.featured_image ) ) {
		// Return the `featured_image` property if it does not appear to be
		// formatted as a URL
		return post.featured_image;
	}

	if ( post.post_thumbnail ) {
		// After the initial load from the REST API, pull the numeric ID
		// from the thumbnail object if one exists
		return post.post_thumbnail.ID;
	}
}
