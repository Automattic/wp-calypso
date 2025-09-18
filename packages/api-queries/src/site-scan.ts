import { enqueueSiteScan, fetchSiteScan, fetchSiteScanHistory } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteScanQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scan' ],
		queryFn: () => fetchSiteScan( siteId ),
	} );

export const siteScanHistoryQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scan', 'history' ],
		queryFn: () => fetchSiteScanHistory( siteId ),
	} );

export const siteScanEnqueueMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => enqueueSiteScan( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
		},
	} );
