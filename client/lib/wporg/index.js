/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import superagent from 'superagent';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import jsonp from './jsonp';
import config from 'config';

const debug = debugFactory( 'wporg' );

/**
 * Constants
 */
var _WPORG_PLUGINS_LIST = 'https://api.wordpress.org/plugins/info/1.1/?action=query_plugins',
	_DEFAULT_PAGE_SIZE = 24,
	_DEFAULT_CATEGORY = 'all',
	_DEFAULT_FIRST_PAGE = 1;

const _WPORG_THEMES_ENDPOINT = 'https://api.wordpress.org/themes/info/1.1/';

function getWporgLocaleCode( ) {
	var currentLocaleCode,
		wpOrgLocaleCode;

	currentLocaleCode = i18n.getLocaleSlug();
	wpOrgLocaleCode = find(
		config( 'languages' ),
		{ langSlug: currentLocaleCode }
	).wpLocale;

	if ( wpOrgLocaleCode === '' ) {
		wpOrgLocaleCode = currentLocaleCode;
	}

	return wpOrgLocaleCode;
}

module.exports = {

	/**
	 * If successful, will call the provided callback with an object with plugin details.
	 * @param {string} pluginSlug The plugin identifier.
	 * @param {function} callback Callback that gets executed after the XHR returns the results.
	 */
	fetchPluginInformation: function( pluginSlug, callback ) {
		var baseUrl,
			query = { fields: 'icons,banners,compatibility,ratings,-contributors', locale: getWporgLocaleCode() };

		pluginSlug = pluginSlug.replace( new RegExp( '.php$' ), '' );

		baseUrl = 'https://api.wordpress.org/plugins/info/1.0/' + pluginSlug + '.jsonp';
		jsonp( baseUrl, query, function( error, data ) {
			if ( error ) {
				debug( 'error downloading plugin details from .org: %s', error );
				callback( error, null );
				return;
			}

			if ( ! data || ! data.slug ) {
				debug( 'unrecognized format fetching plugin details from .org: %s', data );
				callback( new Error( 'Unrecognized response format' ), null );
				return;
			}

			callback( null, data );
		} );
	},
	fetchPluginsList: function( options, callback ) {
		var payload;
		// default variables;
		options.page = options.page || _DEFAULT_FIRST_PAGE;
		options.pageSize = options.pageSize || _DEFAULT_PAGE_SIZE;
		options.category = options.category || _DEFAULT_CATEGORY;
		options.search = options.search;

		payload = 'request[page]=' + options.page + '&request[per_page]=' +
			options.pageSize +
			'&request[fields][icons]=1&request[fields][banners]=1' +
			'&request[fields][compatibility]=1&request[fields][tested]=0' +
			'&request[fields][requires]=0&request[fields][sections]=0';

		if ( options.search ) {
			payload += '&request[search]=' + options.search + '*';
		} else {
			payload += '&request[browse]=' + options.category;
		}
		superagent
			.post( _WPORG_PLUGINS_LIST )
			.set( 'Accept', 'application/json' )
			.send( encodeURI( payload ) )
			.end( function( err, data ) {
				callback( err, data.body );
			} );
	},
	/**
	 * Get information about a given theme from the WordPress.org API.
	 * If provided with a callback, will call that on succes with an object with theme details.
	 * Otherwise, will return a promise.
	 *
	 * @param {string}     themeId  The theme identifier.
	 * @returns {Promise.<Object>}  A promise that returns a `theme` object
	 */
	fetchThemeInformation: function( themeId ) {
		const query = {
			action: 'theme_information',
			// Return an `author` object containing `user_nicename` and `display_name` attrs.
			// This is for consistency with WP.com, which always returns the display name as `author`.
			'request[fields][extended_author]': true,
			'request[slug]': themeId
		};
		return superagent
			.get( _WPORG_THEMES_ENDPOINT )
			.set( 'Accept', 'application/json' )
			.query( query )
			.then( ( { body } ) => ( body ) );
	},
	/**
	 * Get information about a given theme from the WordPress.org API.
	 *
	 * @param  {Object}        options         Theme query
	 * @param  {String}        options.search  Search string
	 * @param  {Number}        options.number  How many themes to return per page
	 * @param  {Number}        options.page    Which page of matching themes to return
	 * @returns {Promise.<Object>}             A promise that returns an object containing a `themes` array and an `info` object
	 */
	fetchThemesList: function( options = {} ) {
		const { search, page, number } = options;
		const query = {
			action: 'query_themes',
			// Return an `author` object containing `user_nicename` and `display_name` attrs.
			// This is for consistency with WP.com, which always returns the display name as `author`.
			'request[fields][extended_author]': true,
			'request[search]': search,
			'request[page]': page,
			'request[per_page]:': number
		};

		return superagent
			.get( _WPORG_THEMES_ENDPOINT )
			.set( 'Accept', 'application/json' )
			.query( query )
			.then( ( { body } ) => ( body ) );
	},
};
