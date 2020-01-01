/**
 * External dependencies
 */

import { find, get } from 'lodash';

/**
 * Returns true if a network request is in-progress for the specified site ID,
 * post type pair, or false otherwise.
 *
 * @param  {object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {string}  postType Post type
 * @return {Boolean}          Whether request is in-progress
 */
export function isRequestingPostTypeTaxonomies( state, siteId, postType ) {
	return get( state.postTypes.taxonomies.requesting, [ siteId, postType ], false );
}

/**
 * Returns taxonomies for the given post type on a site, or null if the
 * taxonomies are not known.
 *
 * @param  {object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {string}  postType Post type
 * @return {Array?}           Post type taxonomies
 */
export function getPostTypeTaxonomies( state, siteId, postType ) {
	return get( state.postTypes.taxonomies.items, [ siteId, postType ], null );
}

/**
 * Returns the given taxonomy for the given post type on a site, or null if the
 * taxonomies are not known.
 *
 * @param  {object}  state        Global state tree
 * @param  {Number}  siteId       Site ID
 * @param  {string}  postType     Post type
 * @param  {string}  taxonomyName Taxonomy name
 * @return {Object?}              Post type taxonomy
 */
export function getPostTypeTaxonomy( state, siteId, postType, taxonomyName ) {
	const taxonomies = getPostTypeTaxonomies( state, siteId, postType );
	return find( taxonomies, { name: taxonomyName } ) || null;
}
