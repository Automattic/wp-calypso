import { get, includes, map, omit, omitBy, some, startsWith } from 'lodash';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * Constants
 */
const REGEXP_SERIALIZED_QUERY = /^(?:(\d+):)?(.*)$/;
// Used for client-side filtering of results from Jetpack sites. Note that Jetpack sites
// only return the 'feature' taxonomy (in the guise of an array called `tags` which
// we normalize to taxonomies.theme_feature to be consistent with results from WPCOM.)
const SEARCH_TAXONOMIES = [ 'feature' ];

// Used for client-side delisting of taxonomy terms. Note that these taxonomy terms often
// have functional purposes, which is why they cannot be removed in the endpoint payload.
//
// As a rule of thumb, only add terms here if you want to hide them visually in the UI.
// Otherwise, they should be delisted in the backend.
const DELISTED_TAXONOMY_TERM_SLUGS = [ 'auto-loading-homepage' ];

// Used for client-side delisting of wp.org themes. Note that these themes are fethced
// directly from wp.org, which is why they cannot be removed in the endpoint payload.
const DELISTED_WPORG_THEMES = [ 'shopline', 'store-shopline' ];

/**
 * Utility
 */

/**
 * Whether a given theme object is premium.
 * @param  {Object} theme Theme object
 * @returns {boolean}      True if the theme is premium
 */
export function isPremium( theme ) {
	const themeStylesheet = get( theme, 'stylesheet', false );
	return themeStylesheet && startsWith( themeStylesheet, 'premium/' );
}

/**
 * Normalizes a theme obtained via the WordPress.com REST API from a Jetpack site
 * @param  {Object} theme  Theme object
 * @returns {Object}        Normalized theme object
 */
export function normalizeJetpackTheme( theme = {} ) {
	if ( ! theme.tags ) {
		return theme;
	}

	return {
		...omit( theme, 'tags' ),
		taxonomies: {
			// Map slugs only since JP sites give us no names
			theme_feature: map( theme.tags, ( slug ) => ( { slug } ) ),
		},
	};
}

/**
 * Normalizes a theme obtained from the WordPress.com REST API
 * @param  {Object} theme  Theme object
 * @returns {Object}        Normalized theme object
 */
export function normalizeWpcomTheme( theme ) {
	const attributesMap = {
		description_long: 'descriptionLong',
		support_documentation: 'supportDocumentation',
		download_uri: 'download',
	};

	if ( ! theme ) {
		return {};
	}

	return Object.fromEntries(
		Object.entries( theme ).map( ( [ key, value ] ) => [ attributesMap[ key ] ?? key, value ] )
	);
}

/**
 * Normalizes a theme obtained from the WordPress.org REST API
 * @param   {Object} theme   Theme object
 * @param   {Object} tier     Theme tier that wporg themes belong to.
 * @returns {Object}        Normalized theme object
 */
export function normalizeWporgTheme( theme, tier ) {
	if ( ! theme ) {
		return {};
	}

	const attributesMap = {
		slug: 'id',
		preview_url: 'demo_uri',
		screenshot_url: 'screenshot',
		download_link: 'download',
	};

	const normalizedTheme = Object.fromEntries(
		Object.entries( omit( theme, [ 'sections', 'author' ] ) ).map( ( [ key, value ] ) => [
			attributesMap[ key ] ?? key,
			value,
		] )
	);

	const description = get( theme, [ 'sections', 'description' ] );
	if ( description ) {
		normalizedTheme.description = description;
	}

	const author = get( theme, [ 'author', 'display_name' ] );
	if ( author ) {
		normalizedTheme.author = author;
	}

	normalizedTheme.theme_tier = tier ?? { slug: 'community' };

	if ( ! normalizedTheme.tags ) {
		return normalizedTheme;
	}

	return {
		...omit( normalizedTheme, 'tags' ),
		taxonomies: {
			theme_feature: map( normalizedTheme.tags, ( name, slug ) => ( { name, slug } ) ),
		},
	};
}

/**
 * Returns a normalized themes query, excluding any values which match the
 * default theme query.
 * @param  {Object} query Themes query
 * @returns {Object}       Normalized themes query
 */
export function getNormalizedThemesQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_THEME_QUERY[ key ] === value );
}

/**
 * Returns a serialized themes query
 * @param  {Object} query  Themes query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized themes query
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
 * @param  {string} serializedQuery Serialized themes query
 * @returns {Object}                 Deserialized themes query details
 */
export function getDeserializedThemesQueryDetails( serializedQuery ) {
	let siteId;
	let query;

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
 * @param  {Object} query  Themes query
 * @param  {number} siteId Optional site ID
 * @returns {string}        Serialized themes query
 */
export function getSerializedThemesQueryWithoutPage( query, siteId ) {
	return getSerializedThemesQuery( omit( query, 'page' ), siteId );
}

/**
 * Returns true if the theme matches the given query, or false otherwise.
 * @param  {Object}  query Query object
 * @param  {Object}  theme Item to consider
 * @returns {boolean}       Whether theme matches query
 */
export function isThemeMatchingQuery( query, theme ) {
	const queryWithDefaults = { ...DEFAULT_THEME_QUERY, ...query };
	return Object.entries( queryWithDefaults ).every( ( [ key, value ] ) => {
		switch ( key ) {
			case 'search': {
				if ( ! value ) {
					return true;
				}

				const search = value.toLowerCase();

				const foundInTaxonomies = some(
					SEARCH_TAXONOMIES,
					( taxonomy ) =>
						theme.taxonomies &&
						some(
							theme.taxonomies[ 'theme_' + taxonomy ],
							( { name } ) => name && includes( name.toLowerCase(), search )
						)
				);

				return (
					foundInTaxonomies ||
					( theme.id && includes( theme.id.toLowerCase(), search ) ) ||
					( theme.name && includes( theme.name.toLowerCase(), search ) ) ||
					( theme.author && includes( theme.author.toLowerCase(), search ) ) ||
					( theme.descriptionLong && includes( theme.descriptionLong.toLowerCase(), search ) )
				);
			}
			case 'filter': {
				if ( ! value ) {
					return true;
				}

				// TODO: Change filters object shape to be more like post's terms, i.e.
				// { color: 'blue,red', feature: 'post-slider' }
				const filters = value.split( ',' );
				return filters.every( ( f ) =>
					some( theme.taxonomies, ( terms ) => some( terms, { slug: f } ) )
				);
			}
		}

		return true;
	} );
}

/**
 * Returns the slugs of the theme's given taxonomy.
 * @param  {Object} theme    The theme object.
 * @param  {string} taxonomy The taxonomy items to get.
 * @returns {Array}           An array of theme taxonomy slugs.
 */
export function getThemeTaxonomySlugs( theme, taxonomy ) {
	const items = get( theme, [ 'taxonomies', taxonomy ], [] );
	return items.map( ( { slug } ) => slug );
}

/**
 * Returns true if a taxonomy term slug is delisted.
 * @param  {string}  slug   The term slug to check for delisting
 * @returns {boolean}       True if term slug is delisted
 */
export function isDelistedTaxonomyTermSlug( slug ) {
	return DELISTED_TAXONOMY_TERM_SLUGS.includes( slug );
}

/**
 * Returns the list of available theme filters, excluding the delisted taxonomy terms.
 * @param {Object}  filters A list of filters.
 * @returns {Object}        A nested list of theme filters, keyed by term slug
 */
export function filterDelistedTaxonomyTermSlugs( filters ) {
	const result = {};
	for ( const taxonomy in filters ) {
		result[ taxonomy ] = Object.fromEntries(
			Object.entries( filters[ taxonomy ] || {} ).filter(
				( [ slug ] ) => ! isDelistedTaxonomyTermSlug( slug )
			)
		);
	}

	return result;
}

/**
 * Is wp.org theme delisted?
 * @param  {Object} theme  Theme object
 * @returns {boolean}         True if theme is delisted
 */
export function isDelisted( theme ) {
	return DELISTED_WPORG_THEMES.includes( theme.id );
}
