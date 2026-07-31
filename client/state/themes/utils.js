import { omit, omitBy } from '@automattic/js-utils';
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

// Word forms used to spell out a year the way WordPress names its default themes:
// `twenty` + a teens word for 2010-2019, `twentytwenty` + a ones word for 2020-2029.
const YEAR_TEENS_WORDS = [
	'ten',
	'eleven',
	'twelve',
	'thirteen',
	'fourteen',
	'fifteen',
	'sixteen',
	'seventeen',
	'eighteen',
	'nineteen',
];
const YEAR_ONES_WORDS = [
	'',
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine',
];
const REGEXP_YEAR = /\b(20[12]\d)\b/g;

/**
 * Utility
 */

/**
 * Whether a given theme object is premium.
 * @param  {Object} theme Theme object
 * @returns {boolean}      True if the theme is premium
 */
export function isPremium( theme ) {
	const themeStylesheet = theme?.stylesheet ?? false;
	return themeStylesheet && themeStylesheet.startsWith( 'premium/' );
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
			theme_feature: theme.tags.map( ( slug ) => ( { slug } ) ),
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

	const description = theme?.sections?.description;
	if ( description ) {
		normalizedTheme.description = description;
	}

	const author = theme?.author?.display_name;
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
			theme_feature: Object.entries( normalizedTheme.tags ?? {} ).map( ( [ slug, name ] ) => ( {
				name,
				slug,
			} ) ),
		},
	};
}

/**
 * Returns the slug of the WordPress default theme released in a given year,
 * e.g. 2011 -> 'twentyeleven', 2024 -> 'twentytwentyfour'.
 *
 * Only the naming scheme is encoded here, not which themes exist: 2018 yields
 * 'twentyeighteen' even though WordPress shipped no default theme that year, and
 * years map ahead of a theme's release. Those simply find nothing, as today.
 * @param  {number} year Four-digit year
 * @returns {?string}     Theme slug, or null for years outside the naming scheme
 */
function getDefaultThemeSlugForYear( year ) {
	if ( year >= 2010 && year <= 2019 ) {
		return `twenty${ YEAR_TEENS_WORDS[ year - 2010 ] }`;
	}

	if ( year >= 2020 && year <= 2029 ) {
		return `twentytwenty${ YEAR_ONES_WORDS[ year - 2020 ] }`;
	}

	return null;
}

/**
 * Rewrites year terms in a theme search string to the slug of the default theme
 * released that year, so that searching "2011" finds Twenty Eleven.
 *
 * The WPCOM theme search index holds no year keyword for the Twenty * themes, so
 * every year term returns zero results on its own. This is applied to the outgoing
 * request only; callers keep displaying and caching against what the user typed.
 * @param  {string} search Search string
 * @returns {string}        Search string with year terms replaced by theme slugs
 */
export function normalizeThemeSearchTerm( search ) {
	if ( ! search ) {
		return search;
	}

	return search.replace(
		REGEXP_YEAR,
		( year ) => getDefaultThemeSlugForYear( Number( year ) ) ?? year
	);
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

				const foundInTaxonomies = SEARCH_TAXONOMIES.some(
					( taxonomy ) =>
						theme.taxonomies &&
						( theme.taxonomies[ 'theme_' + taxonomy ] ?? [] ).some(
							( { name } ) => name && name.toLowerCase().includes( search )
						)
				);

				return (
					foundInTaxonomies ||
					( theme.id && theme.id.toLowerCase().includes( search ) ) ||
					( theme.name && theme.name.toLowerCase().includes( search ) ) ||
					( theme.author && theme.author.toLowerCase().includes( search ) ) ||
					( theme.descriptionLong && theme.descriptionLong.toLowerCase().includes( search ) )
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
					Object.values( theme.taxonomies ?? {} ).some( ( terms ) =>
						( terms ?? [] ).some( ( term ) => term.slug === f )
					)
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
	const items = theme?.taxonomies?.[ taxonomy ] ?? [];
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
 * Is wp.org theme delisted?
 * @param  {Object} theme  Theme object
 * @returns {boolean}         True if theme is delisted
 */
export function isDelisted( theme ) {
	return DELISTED_WPORG_THEMES.includes( theme.id );
}
