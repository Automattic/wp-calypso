/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
import wporg from 'lib/wporg';
import debounce from 'lodash/function/debounce';
import utils from 'lib/plugins/utils';
import { RECEIVE_WPORG_PLUGIN_DATA } from 'state/action-types';

/**
 * Constants
 */
const _LIST_DEFAULT_SIZE = 24,
	_DEFAULT_FIRST_PAGE = 0;

/**
 *  Local variables;
 */
let _fetching = {},
	_fetchingLists = {},
	_currentSearchTerm = null,
	_lastFetchedPagePerCategory = {},
	_totalPagesPerCategory = {};

export default {
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
					type: RECEIVE_WPORG_PLUGIN_DATA,
					pluginSlug: pluginSlug,
					data: data ? utils.normalizePluginData( { detailsFetched: Date.now() }, data ) : null,
					error: error
				} );
			} );
		}
	}
};
