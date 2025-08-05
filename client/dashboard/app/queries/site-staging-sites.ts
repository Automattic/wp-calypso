import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
	createStagingSite,
	deleteStagingSite,
	fetchStagingSiteOf,
} from '../../data/site-staging-site';
import { queryClient } from '../query-client';

export const hasStagingSiteQuery = ( productionSiteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', productionSiteId, 'has-staging-site' ],
		queryFn: () => fetchStagingSiteOf( productionSiteId ),
		select: ( data ) => data.length > 0,
	} );

export const stagingSiteCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => createStagingSite( siteId ),
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
