/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';
import { omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * Constants
 */
const REGEXP_SERIALIZED_QUERY = /^(?:(\d+):)?(.*)$/;

export const oldShowcaseUrl = '//wordpress.com/themes/';

/**
 * Utility
 */

/**
 * Returns a normalized themes query, excluding any values which match the
 * default theme query.
 *
 * @param  {Object} query Themes query
 * @return {Object}       Normalized themes query
 */
export function getNormalizedThemesQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_THEME_QUERY[ key ] === value );
}

/**
 * Returns a serialized themes query
 *
 * @param  {Object} query  Themes query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized themes query
 */
export function getSerializedThemesQuery( query = {}, siteId ) {
	const normalizedQuery = getNormalizedThemesQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	if ( siteId ) {
		return [ siteId, serializedQuery ].join( ':' );
	}

	return serializedQuery;
}

/**
 * Returns an object with details related to the specified serialized query.
 * The object will include siteId and/or query object, if can be parsed.
 *
 * @param  {String} serializedQuery Serialized themes query
 * @return {Object}                 Deserialized themes query details
 */
export function getDeserializedThemesQueryDetails( serializedQuery ) {
	let siteId, query;

	const matches = serializedQuery.match( REGEXP_SERIALIZED_QUERY );
	if ( matches ) {
		siteId = Number( matches[ 1 ] ) || undefined;
		try {
			query = JSON.parse( matches[ 2 ] );
		} catch ( error ) {}
	}

	return { siteId, query };
}

/**
 * Returns a serialized themes query, excluding any page parameter
 *
 * @param  {Object} query  Themes query
 * @param  {Number} siteId Optional site ID
 * @return {String}        Serialized themes query
 */
export function getSerializedThemesQueryWithoutPage( query, siteId ) {
	return getSerializedThemesQuery( omit( query, 'page' ), siteId );
}

export function isPremiumTheme( theme ) {
	if ( ! theme ) {
		return false;
	}

	if ( theme.stylesheet && startsWith( theme.stylesheet, 'premium/' ) ) {
		return true;
	}
	// The /v1.1/sites/:site_id/themes/mine endpoint (which is used by the
	// current-theme reducer, selector, and component) does not return a
	// `stylesheet` attribute. However, it does return a `cost` field (which
	// contains the correct price even if the user has already purchased that
	// theme, or if they have an upgrade that includes all premium themes).
	return !! ( theme.cost && theme.cost.number );
}
