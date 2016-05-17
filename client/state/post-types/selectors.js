/**
 * Returns true if current requesting post types for the specified site ID, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether post types are being requested
 */
export function isRequestingPostTypes( state, siteId ) {
	return !! state.postTypes.requesting[ siteId ];
}

/**
 * Returns the known post types for a site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site post types
 */
export function getPostTypes( state, siteId ) {
	return state.postTypes.items[ siteId ] || null;
}

/**
 * Returns the known post type for a site, given the type slug.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  slug   Post type slug
 * @return {?Object}        Post type
 */
export function getPostType( state, siteId, slug ) {
	const postTypes = getPostTypes( state, siteId );
	if ( ! postTypes ) {
		return null;
	}

	return postTypes[ slug ] || null;
}

/**
 * Returns true if the site supported the post type, false if the site does not
 * support the post type, or null if support cannot be determined (if site is
 * not currently known).
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @param  {String}   slug   Post type slug
 * @return {?Boolean}        Whether site supports post type
 */
export function isPostTypeSupported( state, siteId, slug ) {
	const postTypes = getPostTypes( state, siteId );
	if ( ! postTypes ) {
		return null;
	}

	return !! postTypes[ slug ];
}
