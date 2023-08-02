import {
	STATS_MODULE_SETTINGS_REQUEST,
	STATS_MODULE_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveModuleSettings } from 'calypso/state/stats/module-settings/actions';
import type { AnyAction } from 'redux';

export const doUpdateModuleSettings = ( action: AnyAction ) => {
	const { siteId } = action;

	return [
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/jetpack-stats-dashboard/module-settings`,
				body: action.payload,
			},
			action
		),
	];
};

export const fetch = ( action: AnyAction ) => {
	const { siteId } = action;

	return [
		http(
			{
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/jetpack-stats-dashboard/module-settings`,
				body: {
					dismissed: true,
				},
			},
			action
		),
	];
};

export const onSuccess = ( { siteId }: AnyAction, data: object ) =>
	receiveModuleSettings( siteId, data );

registerHandlers( 'state/data-layer/wpcom/sites/stats/module-settings/index.js', {
	[ STATS_MODULE_SETTINGS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError: () => null,
			// fromApi,
		} ),
	],
	[ STATS_MODULE_SETTINGS_UPDATE ]: [
		dispatchRequest( {
			fetch: doUpdateModuleSettings,
			onSuccess: () => null,
			onError: () => null,
			// fromApi,
		} ),
	],
} );

export default {};
