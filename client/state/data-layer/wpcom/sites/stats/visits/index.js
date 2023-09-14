import { STATS_CHART_COUNTS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveChartCounts } from 'calypso/state/stats/chart-tabs/actions';
import fromApi from './from-api';

export const fetch = ( action ) => {
	const { chartTab, date, period, quantity, siteId, statFields } = action;
	const currentTabFields = chartTab === 'views' ? [ 'views', 'visitors' ] : [ chartTab ];
	const otherTabFields =
		statFields?.filter( ( field ) => ! currentTabFields.includes( field ) ) ?? [];

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/visits`,
				apiVersion: '1.1',
				query: {
					unit: period,
					date,
					quantity,
					stat_fields: currentTabFields.join( ',' ),
				},
			},
			action
		),
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/visits`,
				apiVersion: '1.1',
				query: {
					unit: period,
					date,
					quantity,
					stat_fields: otherTabFields.join( ',' ),
				},
			},
			action
		),
	];
};

export const onSuccess = ( { siteId, period }, data ) => receiveChartCounts( siteId, period, data );

registerHandlers( 'state/data-layer/wpcom/sites/stats/visits/index.js', {
	[ STATS_CHART_COUNTS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError: () => {},
			fromApi,
		} ),
	],
} );

export default {};
