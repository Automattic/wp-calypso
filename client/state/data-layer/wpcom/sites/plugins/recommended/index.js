/**
 * Internal dependencies
 */
import { normalizePluginsList } from 'lib/plugins/utils';
import { PLUGINS_RECOMMENDED_REQUEST } from 'state/action-types';
import { receiveRecommendedPlugins } from 'state/plugins/recommended/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = action => {
	const { siteId, limit = 6 } = action;

	return [
		recordTracksEvent( 'calypso_recommended_plugins_requested', { site_id: siteId, limit } ),
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/plugins/recommended`,
				query: { limit },
			},
			action
		),
	];
};

export const onSuccess = ( { siteId, limit }, data ) => {
	return [
		recordTracksEvent( 'calypso_recommended_plugins_received', { site_id: siteId, limit } ),
		receiveRecommendedPlugins( siteId, normalizePluginsList( data ) ),
	];
};

export const onError = ( { siteId, limit } ) => {
	return [ recordTracksEvent( 'calypso_recommended_plugins_error', { site_id: siteId, limit } ) ];
};

registerHandlers( 'state/data-layer/wpcom/sites/plugins/recommended/index.js', {
	[ PLUGINS_RECOMMENDED_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
