/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { find } from 'lodash';
import { stringify as stringifyQs } from 'qs';

/**
 * Internal dependencies
 */
import jsonp from './jsonp';
import { languages } from 'languages';

const debug = debugFactory( 'wporg' );

/**
 * Constants
 */
const WPORG_PLUGINS_LIST = 'https://api.wordpress.org/plugins/info/1.1/?action=query_plugins';
const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_CATEGORY = 'all';
const DEFAULT_FIRST_PAGE = 1;

const WPORG_THEMES_ENDPOINT = 'https://api.wordpress.org/themes/info/1.1/';

function getWporgLocaleCode() {
	const currentLocaleCode = i18n.getLocaleSlug();
	let wpOrgLocaleCode = find( languages, { langSlug: currentLocaleCode } ).wpLocale;

	if ( wpOrgLocaleCode === '' ) {
		wpOrgLocaleCode = currentLocaleCode;
	}

	return wpOrgLocaleCode;
}

async function pluginRequest( url, body ) {
	try {
		const response = await fetch( url, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		} );

		if ( response.ok ) {
			return [ null, await response.json() ];
		}
		return [ new Error( await response.body ), null ];
	} catch ( error ) {
		return [ error, null ];
	}
}

async function themeRequest( url, query ) {
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
export function fetchPluginInformation( pluginSlug ) {
	const query = {
		fields: 'icons,banners,compatibility,ratings,-contributors',
		locale: getWporgLocaleCode(),
	};

	pluginSlug = pluginSlug.replace( new RegExp( '.php$' ), '' );

	const baseUrl = 'https://api.wordpress.org/plugins/info/1.0/' + pluginSlug + '.jsonp';

	return new Promise( ( resolve, reject ) => {
		jsonp( baseUrl, query, function ( error, data ) {
			if ( error ) {
				debug( 'error downloading plugin details from .org: %s', error );
				reject( error );
				return;
			}

			if ( ! data || ! data.slug ) {
				debug( 'unrecognized format fetching plugin details from .org: %s', data );
				reject( new Error( 'Unrecognized response format' ) );
				return;
			}

			resolve( data );
		} );
	} );
}

export function fetchPluginsList( options, callback ) {
	let payload;
	// default variables;
	const page = options.page || DEFAULT_FIRST_PAGE;
	const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
	const category = options.category || DEFAULT_CATEGORY;
	const search = options.search;

	payload =
		'request[page]=' +
		page +
		'&request[per_page]=' +
		pageSize +
		'&request[fields][icons]=1&request[fields][banners]=1' +
		'&request[fields][compatibility]=1&request[fields][tested]=0' +
		'&request[fields][requires]=0&request[fields][sections]=0';

	if ( search ) {
		payload += '&request[search]=' + search;
	} else {
		payload += '&request[browse]=' + category;
	}

	pluginRequest( WPORG_PLUGINS_LIST, encodeURI( payload ) ).then( ( [ err, data ] ) => {
		callback( err, data );
	} );
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

	return themeRequest( WPORG_THEMES_ENDPOINT, query );
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

	return themeRequest( WPORG_THEMES_ENDPOINT, query );
}
