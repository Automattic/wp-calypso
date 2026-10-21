import { fetchPlans } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const plansQuery = ( coupon: string = '' ) => {
	return queryOptions( {
		queryKey: [ 'plans', coupon ],
		queryFn: () => {
			const params = new URLSearchParams();
			if ( coupon ) {
				params.append( 'coupon_code', coupon );
			}
			return fetchPlans( params );
		},
	} );
};
