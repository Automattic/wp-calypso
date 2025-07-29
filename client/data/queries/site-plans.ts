import { restoreSitePlanSoftware } from '../api/site-hosting';
import { fetchCurrentSitePlan } from '../api/site-plans';

export const siteCurrentPlanQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'plans', 'current' ],
	queryFn: () => fetchCurrentSitePlan( siteId ),
} );

export const sitePlanSoftwareRestoreMutation = ( siteId: number ) => ( {
	mutationFn: () => restoreSitePlanSoftware( siteId ),
} );
