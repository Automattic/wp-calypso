import {
	createStagingSite,
	deleteStagingSite,
	fetchStagingSiteOf,
	fetchStagingSiteSyncState,
	validateStagingSiteQuota,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const hasStagingSiteQuery = ( productionSiteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', productionSiteId, 'has-staging-site' ],
		queryFn: () => fetchStagingSiteOf( productionSiteId ),
		select: ( data ) => data.length > 0,
	} );

export const isCreatingStagingSiteQuery = ( stagingSiteId: number ) =>
	queryOptions( {
		queryKey: [ 'staging-site', stagingSiteId, 'is-creating' ],
		queryFn: () => Promise.resolve( false ),
		staleTime: Infinity,
	} );

export const stagingSiteCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => createStagingSite( siteId ),
		onMutate: () => {
			queryClient.setQueryData( isCreatingStagingSiteQuery( siteId ).queryKey, true );
		},
	} );

export const isDeletingStagingSiteQuery = ( stagingSiteId: number ) =>
	queryOptions( {
		queryKey: [ 'staging-site', stagingSiteId, 'is-deleting' ],
		queryFn: () => Promise.resolve( false ),
		staleTime: Infinity,
	} );

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) =>
	mutationOptions( {
		mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
		onSuccess: () => {
			queryClient.setQueryData( isDeletingStagingSiteQuery( stagingSiteId ).queryKey, true );
		},
	} );

export const stagingSiteSyncStateQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'staging-site-sync-state' ],
		queryFn: () => fetchStagingSiteSyncState( siteId ),
	} );

export const hasValidQuotaQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'has-valid-quota' ],
		queryFn: () => validateStagingSiteQuota( siteId ),
		staleTime: 10 * 1000,
	} );
