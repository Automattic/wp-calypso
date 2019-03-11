/** @format */

/**
 * External dependencies
 */
/**
 * Internal dependencies
 */
import { RECOMMENDED_PLUGINS_REQUEST } from 'state/action-types';
import { receiveRecommendedPlugins } from 'state/plugins/recommended/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { recordTracksEvent } from 'state/analytics/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = action => {
	const { siteId, limit = 6 } = action;

	return [
		recordTracksEvent( 'calypso_recommended_plugins_requested', { siteId, limit } ),
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/plugins/recommend`,
				apiVersion: '2',
				query: { limit },
			},
			action
		),
	];
};

export const onSuccess = ( { siteId, limit }, data ) => {
	return [
		recordTracksEvent( 'calypso_recommended_plugins_received', { siteId, limit } ),
		receiveRecommendedPlugins( siteId, data ),
	];
};

export const onError = action => {
	const { siteId, limit } = action;
	return [ recordTracksEvent( 'calypso_recommended_plugins_error', { siteId, limit } ) ];
};

registerHandlers( 'state/data-layer/wpcom/sites/plugins/recommended/index.js', {
	[ RECOMMENDED_PLUGINS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
