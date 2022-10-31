import { STATS_HIGHLIGHTS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveHighlights } from 'calypso/state/stats/highlights/actions';
// import fromApi from './from-api';
import type { AnyAction } from 'redux';

export const fetch = ( action: AnyAction ) => {
	const { siteId } = action;

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/stats/highlights`,
				apiVersion: '1.1',
			},
			action
		),
	];
};

export const onSuccess = ( { siteId }: AnyAction, data: object ) =>
	receiveHighlights( siteId, data );

registerHandlers( 'state/data-layer/wpcom/sites/stats/highlights/index.js', {
	[ STATS_HIGHLIGHTS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError: () => null,
			// fromApi,
		} ),
	],
} );

export default {};
