import { restoreSitePlanSoftware } from '../../data/site-hosting';
import { fetchCurrentSitePlan } from '../../data/site-plans';

export const siteCurrentPlanQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'plans', 'current' ],
	queryFn: () => fetchCurrentSitePlan( siteId ),
} );

export const sitePlanSoftwareRestoreMutation = ( siteId: string ) => ( {
	mutationFn: () => restoreSitePlanSoftware( siteId ),
} );
