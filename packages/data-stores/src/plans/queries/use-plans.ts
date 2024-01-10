import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import unpackIntroOffer from './lib/unpack-intro-offer';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PricedAPIPlan, PlanNext } from '../types';

interface PlansIndex {
	[ planSlug: string ]: PlanNext;
}

/**
 * Plans from `/plans` endpoint, transformed into a map of planSlug => PlanNext
 */
function usePlans(): UseQueryResult< PlansIndex > {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.plans(),
		queryFn: async () => {
			const data: PricedAPIPlan[] = await wpcomRequest( {
				path: `/plans`,
				apiVersion: '1.5',
			} );

			return Object.fromEntries(
				data.map( ( plan ) => [
					plan.product_slug,
					{
						planSlug: plan.product_slug,
						productSlug: plan.product_slug,
						productId: plan.product_id,
						introOffer: unpackIntroOffer( plan ),
						productNameShort: plan.product_name_short,
						billPeriod: plan.bill_period,
						currencyCode: plan.currency_code,
					},
				] )
			);
		},
	} );
}

export default usePlans;
