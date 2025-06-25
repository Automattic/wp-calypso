import { deleteStagingSite } from '../../data/staging-sites';

export const stagingSiteDeleteMutation = ( stagingSiteId: number, parentSiteId: number ) => ( {
	mutationFn: () => deleteStagingSite( stagingSiteId, parentSiteId ),
} );
