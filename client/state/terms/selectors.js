/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import TreeConvert from 'lib/tree-convert';
import createSelector from 'lib/create-selector';
import { getSerializedTermsQuery } from './utils';

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
export function isRequestingTermsForQuery( state, siteId, taxonomy, query ) {
	const serializedQuery = getSerializedTermsQuery( query );
	return !! get( state.terms.queryRequests, [ siteId, taxonomy, serializedQuery ] );
}

/**
 * Returns an array of terms for the taxonomies query, or null if no terms have been
 * received.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  taxonomy Taxonomy slug
 * @param  {Object}  query    Terms query object
 * @return {?Array}           Terms for the query
 */
export const getTermsForQuery = createSelector(
	( state, siteId, taxonomy, query ) => {
		const manager = get( state.terms.queries, [ siteId, taxonomy ] );
		if ( ! manager ) {
			return null;
		}

		return manager.getItems( query );
	},
	( state, siteId, taxonomy ) => getTerms( state, siteId, taxonomy ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedTermsQuery( query );
		return [ siteId, taxonomy, serializedQuery ].join();
	}
);

/**
 * Returns an array of terms for the taxonomy query, including all known
 * queried pages, or null if the number of pages is unknown.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  taxonomy Taxonomy slug
 * @param  {Object}  query    Terms query object
 * @return {?Array}           Terms for the query
 */
export function getTermsForQueryIgnoringPage( state, siteId, taxonomy, query ) {
	const manager = get( state.terms.queries, [ siteId, taxonomy ] );
	if ( ! manager ) {
		return null;
	}

	return manager.getItemsIgnoringPage( query );
}

/**
 * Returns an hierarchical array of terms for the taxonomies query, or null if no terms have been
 * received.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  taxonomy Taxonomy slug
 * @param  {Object}  query    Term query object
 * @return {?Array}           Terms for the query
 */
export const getTermsHierarchyForQueryIgnoringPage = createSelector(
	( state, siteId, taxonomy, query ) => {
		let terms = getTermsForQueryIgnoringPage( state, siteId, taxonomy, query );
		if ( ! terms ) {
			return terms;
		}

		return ( new TreeConvert( 'ID' ) ).treeify( terms );
	},
	( state, siteId, taxonomy ) => getTerms( state, siteId, taxonomy ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedTermsQuery( query );
		return [ siteId, taxonomy, serializedQuery ].join();
	}
);

/**
 * Returns the last queryable page of terms for the given query / taxonomy, or null if the
 * total number of queryable terms if unknown.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  taxonomy Taxonomy slug
 * @param  {Object}  query    Terms query object
 * @return {?Number}          Last terms page
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
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy slug
 * @return {?Array}          Terms
 */
export function getTerms( state, siteId, taxonomy ) {
	const manager = get( state.terms.queries, [ siteId, taxonomy ] );
	if ( ! manager ) {
		return null;
	}

	return manager.getItems();
}
