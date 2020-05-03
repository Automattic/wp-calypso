/**
 * External dependencies
 */

import { get, range } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSerializedTermsQuery, getSerializedTermsQueryWithoutPage } from './utils';

/**
 * Returns true if currently requesting terms for the taxonomies query, or false
 * otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {object}  query  Taxonomy query object
 * @returns {boolean}        Whether terms are being requested
 */
export function isRequestingTermsForQuery( state, siteId, taxonomy, query ) {
	const serializedQuery = getSerializedTermsQuery( query );
	return !! get( state.terms.queryRequests, [ siteId, taxonomy, serializedQuery ] );
}

/**
 * Returns true if currently requesting terms for a query, excluding all known
 * queried pages, or false otherwise.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {object}  query    Terms query object
 * @returns {boolean}           Terms for the query
 */
export function isRequestingTermsForQueryIgnoringPage( state, siteId, taxonomy, query ) {
	const lastPage = getTermsLastPageForQuery( state, siteId, taxonomy, query );
	if ( null === lastPage ) {
		return false;
	}

	return range( 1, lastPage + 1 ).some( ( page ) => {
		const termsQuery = { ...query, page };
		return isRequestingTermsForQuery( state, siteId, taxonomy, termsQuery );
	} );
}

/**
 * Returns an array of terms for the taxonomies query, or null if no terms have been
 * received.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {object}  query    Terms query object
 * @returns {?Array}           Terms for the query
 */
export const getTermsForQuery = createSelector(
	( state, siteId, taxonomy, query ) => {
		const manager = get( state.terms.queries, [ siteId, taxonomy ] );
		if ( ! manager ) {
			return null;
		}

		return manager.getItems( query );
	},
	( state, siteId, taxonomy ) => get( state.terms.queries, [ siteId, taxonomy ] ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedTermsQuery( query );
		return [ siteId, taxonomy, serializedQuery ].join();
	}
);

/**
 * Returns an array of terms for the taxonomy query, including all known
 * queried pages, or null if the number of pages is unknown.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {object}  query    Terms query object
 * @returns {?Array}           Terms for the query
 */
export const getTermsForQueryIgnoringPage = createSelector(
	( state, siteId, taxonomy, query ) => {
		const manager = get( state.terms.queries, [ siteId, taxonomy ] );
		if ( ! manager ) {
			return null;
		}

		return manager.getItemsIgnoringPage( query );
	},
	( state, siteId, taxonomy ) => get( state.terms.queries, [ siteId, taxonomy ] ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedTermsQueryWithoutPage( query );
		return [ siteId, taxonomy, serializedQuery ].join();
	}
);

/**
 * Returns the last queryable page of terms for the given query / taxonomy, or null if the
 * total number of queryable terms if unknown.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {object}  query    Terms query object
 * @returns {?number}          Last terms page
 */
export function getTermsLastPageForQuery( state, siteId, taxonomy, query ) {
	const manager = get( state.terms.queries, [ siteId, taxonomy ] );
	if ( ! manager ) {
		return null;
	}

	const pages = manager.getNumberOfPages( query );
	if ( null === pages ) {
		return null;
	}

	return Math.max( pages, 1 );
}

/**
 * Returns terms for a site, filtered by taxonomy.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @param  {string} taxonomy Taxonomy slug
 * @returns {?Array}          Terms
 */
export function getTerms( state, siteId, taxonomy ) {
	const manager = get( state.terms.queries, [ siteId, taxonomy ] );
	if ( ! manager ) {
		return null;
	}

	return manager.getItems();
}

/**
 * Returns a term for a site taxonomy.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {number}  termId   Term ID
 * @returns {?object}         Term
 */
export function getTerm( state, siteId, taxonomy, termId ) {
	const manager = get( state.terms.queries, [ siteId, taxonomy ] );
	if ( ! manager ) {
		return null;
	}

	const term = manager.getItem( termId );

	if ( ! term ) {
		return null;
	}

	return term;
}

/**
 * Returns the total count of terms for a specified query
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  taxonomy Taxonomy slug
 * @param  {object}  query    Terms query object
 * @returns {?number}          Count terms
 */
export function countFoundTermsForQuery( state, siteId, taxonomy, query ) {
	const manager = get( state.terms.queries, [ siteId, taxonomy ] );
	if ( ! manager ) {
		return null;
	}

	return manager.getFound( query );
}
