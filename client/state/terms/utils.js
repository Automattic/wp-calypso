/**
 * External dependencies
 */
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';

/**
 * Internal dependencies
 */
import { DEFAULT_TERMS_QUERY } from './constants';

/**
 * Returns a normalized terms query, excluding any values which match the
 * default terms query.
 *
 * @param  {Object} query Posts query
 * @return {Object}       Normalized terms query
 */
export function getNormalizedTermsQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_TERMS_QUERY[ key ] === value );
}

/**
 * Returns a serialized terms query, used as the key in the
 * `state.terms.queries` state object.
 *
 * @param  {Object} query    Terms query
 * @param  {String} taxonomy Taxonomy slug
 * @param  {Number} siteId   Site ID
 * @return {String}          Serialized terms query
 */
export function getSerializedTaxonomyTermsQuery( query = {}, taxonomy, siteId ) {
	const normalizedQuery = getNormalizedTermsQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery ).toLocaleLowerCase();

	return [ siteId, taxonomy, serializedQuery ].join( ':' );
}

/**
 * Returns a serialized terms query, excluding any page parameter, used as the
 * key in the `state.terms.queriesLastPage` state object.
 *
 * @param  {Object} query    Terms query
 * @param  {String} taxonomy Taxonomy slug
 * @param  {Number} siteId   Site ID
 * @return {String}          Serialized terms query
 */
export function getSerializedTaxonomyTermsQueryWithoutPage( query, taxonomy, siteId ) {
	return getSerializedTaxonomyTermsQuery( omit( query, 'page' ), taxonomy, siteId );
}
