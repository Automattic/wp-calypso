import { fetchLatestAtomicTransfer } from '../../data/site-atomic-transfers';
import { deleteStagingSite } from '../../data/site-staging-site';

export const stagingSiteDeleteMutation = ( stagingSiteId: number, productionSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, productionSiteId ),
} );

export const automatedTransferStatusQuery = ( siteId: number ) => ( {
	queryKey: [ 'automated-transfer-status', siteId ],
	queryFn: () => fetchLatestAtomicTransfer( siteId ),
	retry: false, // Don't retry if staging site no longer exists
} );
