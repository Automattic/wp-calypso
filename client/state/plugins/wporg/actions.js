/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
import wporg from 'lib/wporg';
import { normalizePluginData } from 'lib/plugins/utils';
import { WPORG_PLUGIN_DATA_RECEIVE, FETCH_WPORG_PLUGIN_DATA } from 'state/action-types';

/**
 *  Local variables;
 */
const _fetching = {};

export function fetchPluginData( pluginSlug ) {
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
				data: data ? normalizePluginData( { detailsFetched: Date.now() }, data ) : null,
				error: error,
			} );
		} );
	};
}
