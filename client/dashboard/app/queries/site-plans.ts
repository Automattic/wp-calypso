import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { restoreSitePlanSoftware } from '../../data/site-hosting';
import { fetchCurrentSitePlan, fetchSitePlanBySlug } from '../../data/site-plans';

export const siteCurrentPlanQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plans', 'current' ],
		queryFn: () => fetchCurrentSitePlan( siteId ),
	} );

export const sitePlanBySlugQuery = ( siteId: number, productSlug: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plans', productSlug ],
		queryFn: () => fetchSitePlanBySlug( siteId, productSlug ),
	} );

export const sitePlanSoftwareRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => restoreSitePlanSoftware( siteId ),
	} );
