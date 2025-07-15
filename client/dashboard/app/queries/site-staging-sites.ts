import { createStagingSite, deleteStagingSite } from '../../data/site-staging-site';

export const stagingSiteCreateMutation = ( siteId: number ) => ( {
	mutationFn: () => createStagingSite( siteId ),
} );

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
} );
