import { STATS_UTM_METRICS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveMetrics, requestMetricsFail } from 'calypso/state/stats/utm-metrics/actions';
import type { AnyAction } from 'redux';

export const fetch = ( action: AnyAction ) => {
	const { siteId, utmParam } = action;

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/utm/${ utmParam }`,
				apiVersion: '1.1',
				query: {
					max: 10,
					// Today's date in yyyy-mm-dd format.
					date: new Date().toISOString().split( 'T' )[ 0 ],
					days: 7,
				},
			},
			action
		),
	];
};

export const onSuccess = ( { siteId }: AnyAction, data: object ) => receiveMetrics( siteId, data );
export const onError = ( { siteId }: AnyAction ) => requestMetricsFail( siteId );

registerHandlers( 'state/data-layer/wpcom/sites/stats/utm-metrics/index.js', {
	[ STATS_UTM_METRICS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );

export default {};
