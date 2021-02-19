/**
 * Internal dependencies
 */
import { normalizePluginsList } from 'calypso/lib/plugins/utils';
import { PLUGINS_RECOMMENDED_REQUEST } from 'calypso/state/action-types';
import {
	dispatchRecommendPluginsRequestFailure,
	receiveRecommendedPlugins,
} from 'calypso/state/plugins/recommended/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const fetch = ( action ) => {
	const { siteId, limit = 6 } = action;

	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ siteId }/plugins/recommended`,
			query: { limit },
		},
		action
	);
};

export const onSuccess = ( { siteId }, data ) => {
	return receiveRecommendedPlugins( siteId, normalizePluginsList( data ) );
};

export const onError = () => {
	return dispatchRecommendPluginsRequestFailure();
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
