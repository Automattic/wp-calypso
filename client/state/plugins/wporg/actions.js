/**
 * External dependencies
 */
import { get } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
import { fetchPluginInformation } from 'calypso/lib/wporg';
import { normalizePluginData } from 'calypso/lib/plugins/utils';
import { WPORG_PLUGIN_DATA_RECEIVE, FETCH_WPORG_PLUGIN_DATA } from 'calypso/state/action-types';

import 'calypso/state/plugins/init';

// TODO: fix the selector in `selectors.js` to not return `true` by default
function isFetching( state, pluginSlug ) {
	return get( state, [ 'plugins', 'wporg', 'fetchingItems', pluginSlug ], false );
}

export function fetchPluginData( pluginSlug ) {
	return async ( dispatch, getState ) => {
		if ( isFetching( getState(), pluginSlug ) ) {
			return;
		}

		dispatch( {
			type: FETCH_WPORG_PLUGIN_DATA,
			pluginSlug,
		} );

		try {
			const data = await fetchPluginInformation( pluginSlug );

			debug( 'plugin details fetched from .org', pluginSlug, data );
			dispatch( {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug,
				data: normalizePluginData( { detailsFetched: Date.now() }, data ),
			} );
		} catch ( error ) {
			debug( 'plugin details failed to fetch from .org', pluginSlug, error );
			dispatch( {
				type: WPORG_PLUGIN_DATA_RECEIVE,
				pluginSlug,
				error,
			} );
		}
	};
}
