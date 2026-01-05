import { fetchPlans, fetchPlansDetails } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const plansQuery = ( coupon: string = '' ) => {
	const params = new URLSearchParams();
	coupon && params.append( 'coupon_code', coupon );

	return queryOptions( {
		queryKey: [ 'plans', coupon, params ],
		queryFn: () => fetchPlans( params ),
	} );
};

export function plansDetailsQuery() {
	return queryOptions( {
		queryKey: [ 'plans-details' ],
		queryFn: () => fetchPlansDetails(),
	} );
}
