/**
 * External dependencies
 */
import get from 'lodash/get';
import values from 'lodash/values';

/**
 * Internal dependencies
 */
import {
	getSerializedTermsQuery
} from './utils';

/**
 * Returns true if currently requesting terms for the taxonomies query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  taxonomy Taxonomy slug
 * @param  {Object}  query  Taxonomy query object
 * @return {Boolean}        Whether terms are being requested
 */
export function isRequestingSiteTaxonomyTermsForQuery( state, siteId, taxonomy, query ) {
	const serializedQuery = getSerializedTermsQuery( query, taxonomy );
	return !! get( state.terms.queryRequests, [ siteId, serializedQuery ] );
}

/**
 * Returns an array of terms for the taxonomies query, or null if no terms have been
 * received.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  taxonomy Taxonomy slug
 * @param  {Object}  query    Post query object
 * @return {?Array}           Posts for the post query
 */
export function getSiteTaxonomyTermsForQuery( state, siteId, taxonomy, query ) {
	const serializedQuery = getSerializedTermsQuery( query, taxonomy );
	const queryResults = get( state.terms.queries, [ siteId, serializedQuery ] );
	if ( ! queryResults ) {
		return null;
	}

	return queryResults.reduce( ( memo, termId ) => {
		const term = get( state.terms.items, [ siteId, taxonomy, termId ] );
		if ( term ) {
			memo.push( term );
		}

		return memo;
	}, [] );
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
