import { calculateMonthlyPriceForPlan } from '@automattic/calypso-products';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import unpackCostOverrides from './lib/unpack-cost-overrides';
import unpackIntroOffer from './lib/unpack-intro-offer';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PricedAPISitePlan, SitePlan } from '../types';

interface SitePlansIndex {
	[ planSlug: string ]: SitePlan;
}
interface PricedAPISitePlansIndex {
	[ productId: number ]: PricedAPISitePlan;
}

interface Props {
	/**
	 * To match the use-plans hook, `coupon` is required on purpose to mitigate risk of not passing
	 * something through when we should
	 */
	coupon: string | undefined;
	siteId: string | number | null | undefined;
}

/**
 * Plans from `/sites/[siteId]/plans` endpoint, transformed into a map of planSlug => SitePlan
 * - Plans from `/sites/[siteId]/plans`, unlike `/plans`, are returned indexed by product_id, and do not include that in the plan's payload.
 * - UI works with product/plan slugs everywhere, so returned index is transformed to be keyed by product_slug
 */
function useSitePlans( { coupon, siteId }: Props ): UseQueryResult< SitePlansIndex > {
	const queryKeys = useQueryKeysFactory();
	const params = new URLSearchParams();
	coupon && params.append( 'coupon_code', coupon );

	return useQuery( {
		queryKey: queryKeys.sitePlans( coupon, siteId ),
		queryFn: async (): Promise< SitePlansIndex > => {
			const data: PricedAPISitePlansIndex = await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/plans`,
				apiVersion: '1.3',
				query: params.toString(),
			} );

			return Object.fromEntries(
				Object.keys( data ).map( ( productId ) => {
					const plan = data[ Number( productId ) ];
					const originalPriceFull = plan.raw_discount_integer
						? plan.raw_price_integer + plan.raw_discount_integer
						: plan.raw_price_integer;
					const discountedPriceFull = plan.raw_discount_integer ? plan.raw_price_integer : null;

					return [
						plan.product_slug,
						{
							planSlug: plan.product_slug,
							productSlug: plan.product_slug,
							productId: Number( productId ),
							expiry: plan.expiry,
							currentPlan: plan.current_plan,
							hasRedeemedDomainCredit: plan?.has_redeemed_domain_credit,
							purchaseId: plan.id ? Number( plan.id ) : undefined,
							pricing: {
								hasSaleCoupon: plan.has_sale_coupon,
								currencyCode: plan.currency_code,
								introOffer: unpackIntroOffer( plan ),
								costOverrides: unpackCostOverrides( plan ),
								originalPrice: {
									monthly:
										typeof originalPriceFull === 'number'
											? calculateMonthlyPriceForPlan( plan.product_slug, originalPriceFull )
											: null,
									full: originalPriceFull,
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
		enabled: !! siteId,
	} );
}

export default useSitePlans;
