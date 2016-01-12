/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
import wporg from 'lib/wporg';
import utils from 'lib/plugins/utils';
import { RECEIVE_WPORG_PLUGIN_DATA } from 'state/action-types';

/**
 *  Local variables;
 */
let _fetching = {};

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
