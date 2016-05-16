/**
 * External dependencies
 */
import get from 'lodash/get';
import values from 'lodash/values';

/**
 * Returns true if a network request is in-progress for the specified site ID,
 * post type pair, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  postType Post type
 * @return {Boolean}          Whether request is in-progress
 */
export function isRequestingPostTypeTaxonomies( state, siteId, postType ) {
	return get( state.postTypes.taxonomies.requesting, [ siteId, postType ], false );
}

/**
 * Returns taxonomies for the given post type on a site, or null if the
 * taxonomies are not known.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  postType Post type
 * @return {Array?}           Post type taxonomies
 */
export function getPostTypeTaxonomies( state, siteId, postType ) {
	const taxonomies = get( state.postTypes.taxonomies.items, [ siteId, postType ] );
	if ( ! taxonomies ) {
		return null;
	}

	return values( taxonomies );
}
