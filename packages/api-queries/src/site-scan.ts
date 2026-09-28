import {
	fixThreats,
	enqueueSiteScan,
	fetchFixThreatsStatus,
	fetchSiteScan,
	fetchSiteScanHistory,
	ignoreThreat,
	unignoreThreat,
	fixThreat,
	fetchSiteScanCounts,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, skipToken } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const fixThreatsStatusQuery = ( siteId: number, threatIds: number[] ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'fix-threats', 'status', threatIds ],
		queryFn: () => fetchFixThreatsStatus( siteId, threatIds ),
	} );

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

// Client-only: the scan API reports nothing between enqueueing a scan and the
// backend starting it, so the enqueue time is kept in the cache to survive remounts.
export const siteScanEnqueuedAtQuery = ( siteId: number ) =>
	queryOptions< number | null >( {
		queryKey: [ 'site', siteId, 'scan-enqueued-at' ],
		queryFn: skipToken,
		staleTime: Infinity,
	} );

export const siteScanEnqueueMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-scan-enqueue' },
		mutationFn: () => enqueueSiteScan( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
		},
	} );

export const ignoreThreatMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-threat-ignore' },
		mutationFn: ( threatId: number ) => ignoreThreat( siteId, threatId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		},
	} );

export const unignoreThreatMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-threat-unignore' },
		mutationFn: ( threatId: number ) => unignoreThreat( siteId, threatId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		},
	} );

export const fixThreatMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-threat-fix' },
		mutationFn: ( threatId: number ) => fixThreat( siteId, threatId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteScanQuery( siteId ) );
			queryClient.invalidateQueries( siteScanHistoryQuery( siteId ) );
		},
	} );

export const fixThreatsMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-threats-fix' },
		mutationFn: ( threatIds: number[] ) => fixThreats( siteId, threatIds ),
	} );

export const siteScanCountsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scan', 'counts' ],
		queryFn: () => fetchSiteScanCounts( siteId ),
	} );
