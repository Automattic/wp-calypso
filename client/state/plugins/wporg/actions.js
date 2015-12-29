/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
var wporg = require( 'lib/wporg' ),
	debounce = require( 'lodash/function/debounce' ),
	utils = require( 'lib/plugins/utils' );

/**
 * Constants
 */
var _LIST_DEFAULT_SIZE = 24,
	_DEFAULT_FIRST_PAGE = 0;

/**
 *  Local variables;
 */
var _fetching = {},
	_fetchingLists = {},
	_currentSearchTerm = null,
	_lastFetchedPagePerCategory = {},
	_totalPagesPerCategory = {};

var PluginsDataActions = {
	fetchPluginData: function( pluginSlug ) {
		return ( dispatch ) => {
			if ( _fetching[ pluginSlug ] ) {
				return;
			}

			_fetching[ pluginSlug ] = true;

			wporg.fetchPluginInformation( pluginSlug, function( error, data ) {
				_fetching[ pluginSlug ] = null;
				debug( 'plugin details fetched from .org', pluginSlug, error, data );
				dispatch( {
					type: 'RECEIVE_WPORG_PLUGIN_DATA',
					pluginSlug: pluginSlug,
					data: data ? utils.normalizePluginData( { detailsFetched: Date.now() }, data ) : null,
					error: error
				} );
			} );
		}
	}
};

module.exports = PluginsDataActions;
