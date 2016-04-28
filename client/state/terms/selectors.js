/**
 * External dependencies
 */
import get from 'lodash/get';
import values from 'lodash/values';

/**
 * Returns terms for a site, filtered by taxonomy.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy slug
 * @return {Array}           Terms
 */
export function getSiteTaxonomyTerms( state, siteId, taxonomy ) {
	const terms = get( state.terms, [ siteId, taxonomy ] );

	if ( ! terms ) {
		return null;
	}

	return values( terms );
}
