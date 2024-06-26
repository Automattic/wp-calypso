import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
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
function usePlans( {
	coupon,
}: {
	/**
	 * `coupon` required on purpose to mitigate risk with not passing something through when we should
	 */
	coupon: string | undefined;
} ): UseQueryResult< PlansIndex > {
	const queryKeys = useQueryKeysFactory();
	const locale = useLocale();
	const params = new URLSearchParams();
	coupon && params.append( 'coupon_code', coupon );
	params.append( 'locale', locale );
	params.append( 'eligible_request_for_experiment', 'true' );

	return useQuery( {
		queryKey: queryKeys.plans( coupon ),
		queryFn: async (): Promise< PlansIndex > => {
			const data: PricedAPIPlan[] = await wpcomRequest( {
				path: `/plans`,
				apiVersion: '1.5',
				query: params.toString(),
			} );

			return Object.fromEntries(
				data.map( ( plan ) => {
					const discountedPriceFull =
						plan.orig_cost_integer !== plan.raw_price_integer ? plan.raw_price_integer : null;

					return [
						plan.product_slug,
						{
							planSlug: plan.product_slug,
							productSlug: plan.product_slug,
							productId: plan.product_id,
							productNameShort: plan.product_name_short,
							pricing: {
								billPeriod: plan.bill_period,
								currencyCode: plan.currency_code,
								introOffer: unpackIntroOffer( plan ),
								originalPrice: {
									monthly:
										typeof plan.orig_cost_integer === 'number'
											? calculateMonthlyPriceForPlan( plan.product_slug, plan.orig_cost_integer )
											: null,
									full: plan.orig_cost_integer,
								},
								discountedPrice: {
									monthly:
										typeof discountedPriceFull === 'number'
											? calculateMonthlyPriceForPlan( plan.product_slug, discountedPriceFull )
											: null,
									full: discountedPriceFull,
								},
							},
						},
					];
				} )
			);
		},
	} );
}

export default usePlans;
