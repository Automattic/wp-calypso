import { deleteStagingSite, getAutomatedTransferStatus } from '../../data/site-staging-site';

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
} );

export const automatedTransferStatusQuery = ( siteId: number ) => ( {
	queryKey: [ 'automated-transfer-status', siteId ],
	queryFn: () => getAutomatedTransferStatus( siteId ),
	retry: false, // Don't retry if staging site no longer exists
} );
