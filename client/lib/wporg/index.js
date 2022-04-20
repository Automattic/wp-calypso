import languages from '@automattic/languages';
import { find } from 'lodash';
import phpUnserialize from 'phpunserialize';
import { stringify as stringifyQs } from 'qs';
import wpcom from 'calypso/lib/wp';

/**
 * Constants
 */
const WPORG_PLUGINS_ENDPOINT = 'https://api.wordpress.org/plugins/info/1.2/';
const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_CATEGORY = 'all';
const DEFAULT_FIRST_PAGE = 1;

const WPORG_THEMES_ENDPOINT = 'https://api.wordpress.org/themes/info/1.1/';
const WPORG_CORE_TRANSLATIONS_ENDPOINT = 'https://api.wordpress.org/translations/core/1.0/';

function getWporgLocaleCode( currentUserLocale ) {
	let wpOrgLocaleCode = find( languages, { langSlug: currentUserLocale } ).wpLocale;

	if ( wpOrgLocaleCode === '' ) {
		wpOrgLocaleCode = currentUserLocale;
	}

	return wpOrgLocaleCode;
}

async function getRequest( url, query ) {
	const response = await fetch( `${ url }?${ stringifyQs( query ) }`, {
		method: 'GET',
		headers: { Accept: 'application/json' },
	} );

	if ( response.ok ) {
		return await response.json();
	}
	throw new Error( await response.body );
}

/**
 * Fetches details for a particular plugin.
 *
 * @param {string} pluginSlug The plugin identifier.
 * @returns {Promise} Promise with the plugins details.
 */
export function fetchPluginInformation( pluginSlug, locale ) {
	const query = {
		action: 'plugin_information',
		'request[slug]': pluginSlug.replace( new RegExp( '\\.php$' ), '' ),
		'request[locale]': getWporgLocaleCode( locale ),
		'request[fields]': 'icons,short_description,contributors,-added,-donate_link,-homepage',
	};

	return getRequest( WPORG_PLUGINS_ENDPOINT, query );
}

export function fetchPluginsList( options ) {
	// default variables;
	const page = options.page || DEFAULT_FIRST_PAGE;
	const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
	const category = options.category || DEFAULT_CATEGORY;
	const search = options.search;
	const author = options.author;

	const query = {
		action: 'query_plugins',
		'request[page]': page,
		'request[per_page]': pageSize,
		'request[fields]':
			'icons,last_updated,rating,active_installs,tested,-downloaded,-ratings,-requires,-requires_php,-tags,-contributors,-added,-donate_link,-homepage',
		'request[locale]': getWporgLocaleCode( options.locale ),
	};

	if ( search ) {
		query[ 'request[search]' ] = search;
	}

	if ( author ) {
		query[ 'request[author]' ] = author;
	}

	if ( ! search && ! author ) {
		query[ 'request[browse]' ] = category;
	}

	return getRequest( WPORG_PLUGINS_ENDPOINT, query );
}

const createIconsObject = ( pluginSlug, iconsArray ) => {
	const icons = phpUnserialize( iconsArray );
	return Object.values( icons ).reduce( ( prev, { resolution, filename, location, revision } ) => {
		prev[
			resolution
		] = `https://ps.w.org/${ pluginSlug }/${ location }/${ filename }?rev=${ revision }`;
		return prev;
	}, {} );
};

const createAuthorUrl = ( { header_author_uri, header_author } ) =>
	`<a href="${ header_author_uri }">${ header_author }</a>`;

const mapIndexResultsToPluginData = ( results ) => {
	return results.map( ( { fields: hit } ) => {
		return {
			name: hit.title_en, // TODO: add localization
			slug: hit.slug,
			version: hit.stable_tag,
			author: createAuthorUrl( hit ),
			tested: hit.tested,
			rating: hit.rating,
			num_ratings: hit.num_ratings,
			support_threads: hit.support_threads,
			support_threads_resolved: hit.support_threads_resolved,
			active_installs: hit.active_installs,
			last_updated: hit.last_updated,
			short_description: hit.excerpt_en, // TODO: add localization
			icons: createIconsObject( hit.slug, hit.meta.assets_icons.value ),
		};
	} );
};

export async function fetchWPOrgPluginsFromIndex( options ) {
	const category = options.category || DEFAULT_CATEGORY;
	const search = options.search;
	const author = options.author;

	// Set up base query
	const size = options.pageSize || DEFAULT_PAGE_SIZE;
	const from = ( ( options.page || DEFAULT_FIRST_PAGE ) - 1 ) * size;
	const must = [];
	const should = [];
	const query = {
		bool: {
			must,
			should,
		},
	};

	// add a match clause to the query
	const addMatch = ( term, match ) => {
		term.push( { match } );
	};

	if ( search ) {
		must.push( {
			multi_match: {
				fields: [
					'title.en^0.1',
					'content.en^0.1',
					'excerpt.en^0.1',
					'tag.name.en^0.1',
					'category.name.en^0.1',
					'author_login^0.1',
					'author^0.1',
					'slug^0.1',
				],
				query: search,
				operator: 'and',
			},
		} );
	}

	if ( author ) {
		addMatch( must, { author } );
	}

	// matching category if no other criteria given
	if ( ! search && ! author ) {
		addMatch( must, { 'taxonomy.plugin_category.name': category } );
	}

	const fields = [
		'rating',
		'post_id',
		'meta.assets_icons.value',
		'taxonomy.plugin_category.name',
		'excerpt_en',
		'taxonomy.plugin_tags.name',
		'title_en',
		'stable_tag',
		'author',
		'tested',
		'num_ratings',
		'support_threads',
		'support_threads_resolved',
		'active_installs',
		'last_updated',
	];

	// TODO move this request to wp data layer
	const res = wpcom.req.post(
		{
			path: '/sites/108986944/search',
			apiNamespace: 'rest/v1',
			body: { query, fields, size, from },
		},
		( error, body, headers ) => {
			// eslint-disable-next-line no-console
			console.log( 'callback', { error, body, headers } ); // body returns ''
			return {
				info: {
					page: options.page || DEFAULT_FIRST_PAGE,
					pages: Math.ceil( body.results.total / size ),
					results: body.results.total,
				},
				plugins: mapIndexResultsToPluginData( body.results.hits ),
			};
		}
	);

	return res;

	// const ret = {
	// 	info: {
	// 		page: options.page || DEFAULT_FIRST_PAGE,
	// 		pages: Math.ceil( res.results.total / size ),
	// 		results: res.results.total,
	// 	},
	// 	plugins: mapIndexResultsToPluginData( res.results.hits ),
	// };

	// console.log( { ret } );

	// return ret;
}

/**
 * Get information about a given theme from the WordPress.org API.
 * If provided with a callback, will call that on succes with an object with theme details.
 * Otherwise, will return a promise.
 *
 * @param {string}     themeId  The theme identifier.
 * @returns {Promise.<object>}  A promise that returns a `theme` object
 */
export function fetchThemeInformation( themeId ) {
	const query = {
		action: 'theme_information',
		// Return an `author` object containing `user_nicename` and `display_name` attrs.
		// This is for consistency with WP.com, which always returns the display name as `author`.
		'request[fields][extended_author]': true,
		'request[slug]': themeId,
	};

	return getRequest( WPORG_THEMES_ENDPOINT, query );
}

/**
 * Get information about a given theme from the WordPress.org API.
 *
 * @param  {object}        options         Theme query
 * @param  {string}        options.search  Search string
 * @param  {number}        options.number  How many themes to return per page
 * @param  {number}        options.page    Which page of matching themes to return
 * @returns {Promise.<object>}             A promise that returns an object containing a `themes` array and an `info` object
 */
export function fetchThemesList( options = {} ) {
	const { search, page, number } = options;
	const query = {
		action: 'query_themes',
		// Return an `author` object containing `user_nicename` and `display_name` attrs.
		// This is for consistency with WP.com, which always returns the display name as `author`.
		'request[fields][extended_author]': true,
		'request[search]': search,
		'request[page]': page,
		'request[per_page]:': number,
	};

	return getRequest( WPORG_THEMES_ENDPOINT, query );
}

/**
 * Get available WP.org translations.
 * See: https://codex.wordpress.org/WordPress.org_API
 *
 * @param  {string}        wpVersion       The WordPress.org version, like "5.8.1".
 * @returns {Promise.<object>}             A promise that returns an object containing a `translations` array.
 */
export function fetchTranslationsList( wpVersion ) {
	const query = { version: wpVersion };
	return getRequest( WPORG_CORE_TRANSLATIONS_ENDPOINT, query );
}
