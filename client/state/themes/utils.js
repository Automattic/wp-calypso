/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';
import { filter, get, map, mapKeys, omit, omitBy, split } from 'lodash';

/**
 * Internal dependencies
 */
import { isThemeMatchingQuery } from 'lib/query-manager/theme/util';
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
  * Normalizes a theme obtained from the WordPress.com REST API
  *
  * @param  {Object} theme  Themes object
  * @return {Object}        Normalized theme object
  */
export function normalizeWpcomTheme( theme ) {
	const attributesMap = {
		description_long: 'descriptionLong',
		support_documentation: 'supportDocumentation',
		download_uri: 'download'
	};

	return mapKeys( theme, ( value, key ) => (
		get( attributesMap, key, key )
	) );
}

/**
 * Normalizes a theme obtained from the WordPress.org REST API
 *
 * @param  {Object} theme  Themes object
 * @return {Object}        Normalized theme object
 */
export function normalizeWporgTheme( theme ) {
	const attributesMap = {
		slug: 'id',
		preview_url: 'demo_uri',
		screenshot_url: 'screenshot',
		download_link: 'download'
	};

	const normalizedTheme = mapKeys( theme, ( value, key ) => (
		get( attributesMap, key, key )
	) );

	if ( ! normalizedTheme.tags ) {
		return normalizedTheme;
	}

	return {
		...omit( normalizedTheme, 'tags' ),
		taxonomies: { theme_feature: map( normalizedTheme.tags,
			( name, slug ) => ( { name, slug } )
		) }
	};
}

/**
 * Given a theme stylesheet string (like 'pub/twentysixteen'), returns the corresponding theme ID ('twentysixteen').
 *
 * @param  {String}  stylesheet Theme stylesheet
 * @return {?String}            Theme ID
 */
export function getThemeIdFromStylesheet( stylesheet ) {
	const [ , slug ] = split( stylesheet, '/', 2 );
	if ( ! slug ) {
		return stylesheet;
	}
	return slug;
}

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

/**
 * Returns a filtered themes array. Filtering is done based on particular themes
 * matching provided query
 *
 * @param  {Array}  themes Array of themes objects
 * @param  {Object} query  Themes query
 * @return {Array}         Filtered themes
 */
export function filterThemesForJetpack( themes, query ) {
	return filter( themes, theme => isThemeMatchingQuery( theme, query ) );
}
