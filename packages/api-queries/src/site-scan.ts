import {
	enqueueSiteScan,
	fetchSiteScan,
	fetchSiteScanHistory,
	ignoreThreat,
	unignoreThreat,
	fixThreat,
} from '@automattic/api-core';
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

export const ignoreThreatMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( threatId: number ) => ignoreThreat( siteId, threatId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		},
	} );

export const unignoreThreatMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( threatId: number ) => unignoreThreat( siteId, threatId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		},
	} );

export const fixThreatMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( threatId: number ) => fixThreat( siteId, threatId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		},
	} );
