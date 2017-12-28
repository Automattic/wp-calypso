/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
import wporg from 'client/lib/wporg';
import utils from 'client/lib/plugins/utils';
import { WPORG_PLUGIN_DATA_RECEIVE, FETCH_WPORG_PLUGIN_DATA } from 'client/state/action-types';

/**
 *  Local variables;
 */
let _fetching = {};

export default {
	fetchPluginData: function( pluginSlug ) {
		return dispatch => {
			if ( _fetching[ pluginSlug ] ) {
				return;
			}
			_fetching[ pluginSlug ] = true;

			setTimeout( () => {
				dispatch( {
					type: FETCH_WPORG_PLUGIN_DATA,
					pluginSlug: pluginSlug,
				} );
			}, 1 );

			wporg.fetchPluginInformation( pluginSlug, function( error, data ) {
				_fetching[ pluginSlug ] = null;
				debug( 'plugin details fetched from .org', pluginSlug, error, data );

				dispatch( {
					type: WPORG_PLUGIN_DATA_RECEIVE,
					pluginSlug: pluginSlug,
					data: data ? utils.normalizePluginData( { detailsFetched: Date.now() }, data ) : null,
					error: error,
				} );
			} );
		};
	},
};
