import { useQuery } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PricedAPIPlan, PlanNext } from '../types';

interface PlansIndex {
	[ planSlug: string ]: PlanNext;
}

function usePlans() {
	const queryKeys = useQueryKeysFactory();

	return useQuery< PricedAPIPlan[], Error, PlansIndex >( {
		queryKey: queryKeys.plans(),
		queryFn: async () =>
			await wpcomRequest( {
				path: `/plans`,
				apiVersion: '1.5',
			} ),
		select: useCallback( ( data: PricedAPIPlan[] ) => {
			return data.reduce< PlansIndex >( ( acc, plan ) => {
				return {
					...acc,
					[ plan.product_slug ]: {
						planSlug: plan.product_slug,
						productSlug: plan.product_slug,
						productId: plan.product_id,
						productNameShort: plan.product_name_short,
						billPeriod: plan.bill_period,
						currencyCode: plan.currency_code,
					},
				};
			}, {} );
		}, [] ),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}

export default usePlans;
