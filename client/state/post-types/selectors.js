import 'calypso/state/post-types/init';

/**
 * Returns the known post types for a site.
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?Object}        Site post types
 */
export function getPostTypes( state, siteId ) {
	return state.postTypes.items[ siteId ] || null;
}

/**
 * Returns the known post type for a site, given the type slug.
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  slug   Post type slug
 * @returns {?Object}        Post type
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
 * @param  {Object}   state   Global state tree
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
