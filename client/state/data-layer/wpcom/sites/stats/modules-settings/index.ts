import {
	STATS_MODULES_SETTINGS_REQUEST,
	STATS_MODULES_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveModulesSettings } from 'calypso/state/stats/modules-settings/actions';
import type { AnyAction } from 'redux';

export const doUpdateModulesSettings = ( action: AnyAction ) => {
	const { siteId } = action;

	return [
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/jetpack-stats-dashboard/modules-settings`,
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
				path: `/sites/${ siteId }/jetpack-stats-dashboard/modules-settings`,
				body: {
					dismissed: true,
				},
			},
			action
		),
	];
};

export const onSuccess = ( { siteId }: AnyAction, data: object ) =>
	receiveModulesSettings( siteId, data );

registerHandlers( 'state/data-layer/wpcom/sites/stats/modules-settings/index.js', {
	[ STATS_MODULES_SETTINGS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError: () => null,
			// fromApi,
		} ),
	],
	[ STATS_MODULES_SETTINGS_UPDATE ]: [
		dispatchRequest( {
			fetch: doUpdateModulesSettings,
			onSuccess: () => null,
			onError: () => null,
			// fromApi,
		} ),
	],
} );

export default {};
