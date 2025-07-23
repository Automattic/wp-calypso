import { createStagingSite, deleteStagingSite } from '../../data/site-staging-site';

export const STAGING_SITE_DELETE_MUTATION_KEY = 'staging-site-delete-mutation';

export const stagingSiteCreateMutation = ( siteId: number ) => ( {
	mutationFn: () => createStagingSite( siteId ),
} );

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
	mutationKey: [ STAGING_SITE_DELETE_MUTATION_KEY, stagingSiteId ],
} );
