/**
 * External dependencies
 */
var debug = require( 'debug' )( 'wporg' ),
	i18n = require( 'i18n-calypso' ),
	superagent = require( 'superagent' );

/**
 * Internal dependencies
 */
var jsonp = require( './jsonp' ),
	config = require( 'config' );

/**
 * Constants
 */
var _WPORG_PLUGINS_LIST = 'https://api.wordpress.org/plugins/info/1.1/?action=query_plugins',
	_DEFAULT_PAGE_SIZE = 24,
	_DEFAULT_CATEGORY = 'all',
	_DEFAULT_FIRST_PAGE = 1;

function getWporgLocaleCode( ) {
	var currentLocaleCode,
		wpOrgLocaleCode;

	currentLocaleCode = i18n.getLocaleSlug();
	wpOrgLocaleCode = config( 'languages' ).find( function( language ) {
		return language.langSlug === currentLocaleCode;
	} ).wpLocale;

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
	}
};
