import { restoreSitePlanSoftware } from '../../data/site-hosting';
import { fetchCurrentSitePlan } from '../../data/site-plans';

export const siteCurrentPlanQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'plans', 'current' ],
	queryFn: () => fetchCurrentSitePlan( siteId ),
} );

export const sitePlanSoftwareRestoreMutation = ( siteId: number ) => ( {
	mutationFn: () => restoreSitePlanSoftware( siteId ),
} );
