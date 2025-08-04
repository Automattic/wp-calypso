import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { restoreSitePlanSoftware } from '../../data/site-hosting';
import { fetchSitePlans } from '../../data/site-plans';

export const siteCurrentPlanQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plans', 'current' ],
		queryFn: async () => {
			const plans = await fetchSitePlans( siteId );
			const plan = Object.values( plans ).find( ( plan ) => plan.current_plan );
			if ( ! plan ) {
				throw new Error( 'No current plan found' );
			}
			return plan;
		},
	} );

export const sitePlanBySlugQuery = ( siteId: number, productSlug: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plans', productSlug ],
		queryFn: async () => {
			const plans = await fetchSitePlans( siteId );
			const plan = Object.values( plans ).find( ( plan ) => plan.product_slug === productSlug );
			if ( ! plan ) {
				throw new Error( `The plan ${ productSlug } cannot be found` );
			}
			return plan;
		},
	} );

export const sitePlanSoftwareRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => restoreSitePlanSoftware( siteId ),
	} );
