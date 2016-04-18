/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Returns term IDs for a site, filtered by taxonomy.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy slug
 * @return {Array}           Terms
 */
export function getSiteTaxonomyTermIds( state, siteId, taxonomy ) {
	return get( state.site.taxonomies, [ siteId, taxonomy ], [] );
}

export function getSiteTaxonomies( state, siteId ) {
	return get( state.site.taxonomies, [ siteId ], {} );
}
