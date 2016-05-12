/**
 * External dependencies
 */
import get from 'lodash/get';
import values from 'lodash/values';

/**
 * Returns true if a network request is in-progress for the specified site ID,
 * taxonomy pair, or false otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  taxonomy Taxonomy Slug
 * @return {Boolean}          Whether request is in-progress
 */
export function isRequestingSiteTaxonomyTerms( state, siteId, taxonomy ) {
	if ( ! state.terms ) {
		return false;
	}

	return get( state.terms.requesting, [ siteId, taxonomy ], false );
}

/**
 * Returns terms for a site, filtered by taxonomy.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy slug
 * @return {Array}           Terms
 */
export function getSiteTaxonomyTerms( state, siteId, taxonomy ) {
	const terms = get( state.terms, [ 'items', siteId, taxonomy ] );

	if ( ! terms ) {
		return null;
	}

	return values( terms );
}
