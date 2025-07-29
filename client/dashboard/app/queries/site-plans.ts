import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { restoreSitePlanSoftware } from '../../data/site-hosting';
import { fetchCurrentSitePlan } from '../../data/site-plans';

export const siteCurrentPlanQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plans', 'current' ],
		queryFn: () => fetchCurrentSitePlan( siteId ),
	} );

export const sitePlanSoftwareRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => restoreSitePlanSoftware( siteId ),
	} );
