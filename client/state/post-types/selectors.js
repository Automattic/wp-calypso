/**
 * Returns the known post types for a site.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?object}        Site post types
 */
export function getPostTypes( state, siteId ) {
	return state.postTypes.items[ siteId ] || null;
}

/**
 * Returns the known post type for a site, given the type slug.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  slug   Post type slug
 * @returns {?object}        Post type
 */
export function getPostType( state, siteId, slug ) {
	const postTypes = getPostTypes( state, siteId );
	if ( ! postTypes ) {
		return null;
	}

	return postTypes[ slug ] || null;
}

/**
 * Returns the label for the post type.
 *
 * @param  {object}   state   Global state tree
 * @param  {number}   siteId  Site ID
 * @param  {string}   slug    Post type slug
 * @param  {string}   label   Feature label
 * @param  {string}   localeSlug LocalSlug @TODO to remove (see note below)
 * @returns {?boolean}         Whether post type supports feature
 */
export function getPostTypeLabel( state, siteId, slug, label, localeSlug ) {
	const postType = getPostType( state, siteId, slug );
	if ( postType ) {
		let postTypeLabel = postType.labels[ label ];

		/*
		 * Temporary workaround to Sentence case label from core API for EN langs
		 * @TODO: Remove when https://core.trac.wordpress.org/ticket/49616 is merged
		 */

		if ( localeSlug && ( 'en' === localeSlug || 'en-gb' === localeSlug ) ) {
			postTypeLabel = postTypeLabel[ 0 ].toUpperCase() + postTypeLabel.slice( 1 ).toLowerCase();
		}

		return postTypeLabel;
	}
	return null;
}

/**
 * Returns true if the post type supports the specified feature, false if the
 * post type does not support the specified feature, or null if post type
 * support cannot be determined.
 *
 * @param  {object}   state   Global state tree
 * @param  {number}   siteId  Site ID
 * @param  {string}   slug    Post type slug
 * @param  {string}   feature Feature slug
 * @returns {?boolean}         Whether post type supports feature
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
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @param  {string}   slug   Post type slug
 * @returns {?boolean}        Whether site supports post type
 */
export function isPostTypeSupported( state, siteId, slug ) {
	const postTypes = getPostTypes( state, siteId );
	if ( ! postTypes ) {
		return null;
	}

	return !! postTypes[ slug ];
}
