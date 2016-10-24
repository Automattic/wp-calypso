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
 * Returns true if the post type supports the specified feature, false if the
 * post type does not support the specified feature, or null if post type
 * support cannot be determined.
 *
 * @param  {Object}   state   Global state tree
 * @param  {Number}   siteId  Site ID
 * @param  {String}   slug    Post type slug
 * @param  {String}   feature Feature slug
 * @return {?Boolean}         Whether post type supports feature
 */
export function postTypeSupports( state, siteId, slug, feature ) {
	// Hard-coded overrides; even if we know the post type object, continue to
	// defer to these values. Indicates that REST API supports are inaccurate.
	switch ( slug ) {
		case 'post':
			switch ( feature ) {
				case 'publicize':
					return true;
			}
	}

	const postType = getPostType( state, siteId, slug );
	if ( postType ) {
		return !! postType.supports[ feature ];
	}

	// Hard-coded fallbacks; while themes can technically override these
	// supports, we can be relatively safe in making the assumption. By
	// defining fallbacks, we avoid UI flickering after request completes.
	switch ( slug ) {
		case 'page':
			switch ( feature ) {
				case 'publicize':
					return false;
			}
	}

	return null;
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
