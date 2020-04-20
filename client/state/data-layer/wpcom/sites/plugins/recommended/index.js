/**
 * Internal dependencies
 */
import { normalizePluginsList } from 'lib/plugins/utils';
import { PLUGINS_RECOMMENDED_REQUEST } from 'state/action-types';
import {
	dispatchRecommendPluginsRequestFailure,
	receiveRecommendedPlugins,
} from 'state/plugins/recommended/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

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
