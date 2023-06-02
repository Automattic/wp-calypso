import languages from '@automattic/languages';
import { find } from 'lodash';
import { stringify as stringifyQs } from 'qs';
import { RequestError } from './request-error';

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

	throw new RequestError( await response.body, response );
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
	const tag = options.tag;

	const query = {
		action: 'query_plugins',
		'request[page]': page,
		'request[per_page]': pageSize,
		'request[fields]':
			'icons,last_updated,rating,active_installs,tested,-downloaded,-ratings,-requires,-requires_php,-contributors,-added,-donate_link,-homepage',
		'request[locale]': getWporgLocaleCode( options.locale ),
	};

	if ( search ) {
		query[ 'request[search]' ] = search;
	}

	if ( author ) {
		query[ 'request[author]' ] = author;
	}

	if ( tag ) {
		query[ 'request[tag]' ] = tag;
	}

	if ( ! search && ! author && ! tag ) {
		query[ 'request[browse]' ] = category;
	}

	return getRequest( WPORG_PLUGINS_ENDPOINT, query );
}

/**
 * Get information about a given theme from the WordPress.org API.
 * If provided with a callback, will call that on succes with an object with theme details.
 * Otherwise, will return a promise.
 *
 * @param {string}     themeId  The theme identifier.
 * @returns {Promise.<Object>}  A promise that returns a `theme` object
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
 * @param  {Object}        options         Theme query
 * @param  {string}        options.search  Search string
 * @param  {number}        options.number  How many themes to return per page
 * @param  {number}        options.page    Which page of matching themes to return
 * @returns {Promise.<Object>}             A promise that returns an object containing a `themes` array and an `info` object
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
 * @returns {Promise.<Object>}             A promise that returns an object containing a `translations` array.
 */
export function fetchTranslationsList( wpVersion ) {
	const query = { version: wpVersion };
	return getRequest( WPORG_CORE_TRANSLATIONS_ENDPOINT, query );
}
