import { fetchPlans, fetchPlansDetails, fetchPricedSitePlans } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const plansQuery = ( coupon: string, locale: string ) => {
	const params = new URLSearchParams();
	coupon && params.append( 'coupon_code', coupon );
	params.append( 'locale', locale );

	return queryOptions( {
		queryKey: [ 'plans', locale, coupon, params ],
		queryFn: () => fetchPlans( params ),
	} );
};

export function sitePricedPlansQuery( coupon: string | undefined, siteId: number ) {
	return queryOptions( {
		queryKey: [ 'site-plans', siteId, coupon ],
		queryFn: () => fetchPricedSitePlans( coupon, siteId ),
	} );
}

export function plansDetailsQuery() {
	return queryOptions( {
		queryKey: [ 'plans-details' ],
		queryFn: () => fetchPlansDetails(),
	} );
}
