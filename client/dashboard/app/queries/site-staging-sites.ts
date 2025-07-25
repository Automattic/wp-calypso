import {
	createStagingSite,
	deleteStagingSite,
	fetchStagingSiteOf,
	StagingSite,
} from '../../data/site-staging-site';
import { queryClient } from '../query-client';

export const hasStagingSiteQuery = ( productionSiteId: number ) => ( {
	queryKey: [ 'site', productionSiteId, 'has-staging-site' ],
	queryFn: () => fetchStagingSiteOf( productionSiteId ),
	select: ( data: Array< StagingSite > ) => data.length > 0,
} );

export const stagingSiteCreateMutation = ( siteId: number ) => ( {
	mutationFn: () => createStagingSite( siteId ),
} );

export const isDeletingStagingSiteQuery = ( stagingSiteId: number ) => ( {
	queryKey: [ 'staging-site', stagingSiteId, 'is-deleting' ],
	queryFn: () => Promise.resolve( false ),
	staleTime: Infinity,
} );

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
	onSuccess: () => {
		queryClient.setQueryData( isDeletingStagingSiteQuery( stagingSiteId ).queryKey, true );
	},
} );
