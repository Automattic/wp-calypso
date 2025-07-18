import {
	createStagingSite,
	deleteStagingSite,
	fetchStagingSiteData,
} from '../../data/site-staging-site';

export const STAGING_SITE_DELETE_MUTATION_KEY = 'staging-site-delete-mutation';

export const stagingSiteCreateMutation = ( siteId: number ) => ( {
	mutationFn: () => createStagingSite( siteId ),
} );

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
	mutationKey: [ STAGING_SITE_DELETE_MUTATION_KEY, stagingSiteId ],
} );

export const stagingSiteDeleteStatusQuery = ( productionSiteId: number ) => ( {
	queryKey: [ 'staging-site-delete-status', productionSiteId ],
	queryFn: () => fetchStagingSiteData( productionSiteId ),
	refetchInterval: 3000,
	retry: ( failureCount: number ) => {
		// Always retry on errors since we expect 200 responses
		return failureCount < 3;
	},
} );
