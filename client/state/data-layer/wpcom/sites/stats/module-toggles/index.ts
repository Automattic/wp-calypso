import {
	STATS_MODULE_TOGGLES_REQUEST,
	STATS_MODULE_TOGGLES_UPDATE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveModuleToggles } from 'calypso/state/stats/module-toggles/actions';
import type { AnyAction } from 'redux';

export const doUpdateModuleToggles = ( action: AnyAction ) => {
	const { siteId } = action;

	return [
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/jetpack-stats-dashboard/modules`,
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
				path: `/sites/${ siteId }/jetpack-stats-dashboard/modules`,
				body: {
					dismissed: true,
				},
			},
			action
		),
	];
};

export const onSuccess = ( { siteId }: AnyAction, data: object ) =>
	receiveModuleToggles( siteId, data );

registerHandlers( 'state/data-layer/wpcom/sites/stats/module-toggles/index.js', {
	[ STATS_MODULE_TOGGLES_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError: () => null,
			// fromApi,
		} ),
	],
	[ STATS_MODULE_TOGGLES_UPDATE ]: [
		dispatchRequest( {
			fetch: doUpdateModuleToggles,
			onSuccess: () => null,
			onError: () => null,
			// fromApi,
		} ),
	],
} );

export default {};
