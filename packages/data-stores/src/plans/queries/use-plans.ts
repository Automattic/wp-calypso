import { isEnabled } from '@automattic/calypso-config';
import { calculateMonthlyPriceForPlan, getPlan } from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from '../../wpcom-request';
import unpackIntroOffer from './lib/unpack-intro-offer';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PricedAPIPlan, PlanNext } from '../types';

interface PlansIndex {
	[ planSlug: string ]: PlanNext;
}

type RequestFunction = ( params: {
	path: string;
	apiVersion: string;
	query: string;
} ) => Promise< PricedAPIPlan[] >;

/**
 * Request function for Jetpack that bypasses proxy and goes directly to WordPress.com
 */
const jetpackRequestFunction: RequestFunction = async ( params ) => {
	const queryParams = params.query ? `?${ params.query }` : '';
	const url = `https://public-api.wordpress.com/rest/v${ params.apiVersion }${ params.path }${ queryParams }`;
	const response = await fetch( url, {
		method: 'GET',
		credentials: 'omit', // Don't send cookies to avoid CORS issues
	} );
	if ( ! response.ok ) {
		throw new Error( `API request failed: ${ response.status }` );
	}
	return response.json();
};

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
	if ( coupon ) {
		params.append( 'coupon_code', coupon );
	}
	params.append( 'locale', locale );

	// Auto-detect Jetpack context and use appropriate request function
	const isJetpack = isEnabled( 'is_running_in_jetpack_site' );

	const requestFn = isJetpack ? jetpackRequestFunction : wpcomRequest;

	return useQuery( {
		queryKey: queryKeys.plans( coupon ),
		queryFn: async (): Promise< PricedAPIPlan[] > =>
			requestFn( {
				path: '/plans',
				apiVersion: '1.5',
				query: params.toString(),
			} ),
		select: ( data ): PlansIndex => {
			// Filter out unknown products in case the API returns products not hardcoded in calypso-products.
			const knownPlans = data.filter( ( plan ) => getPlan( plan.product_slug ) );

			return Object.fromEntries(
				knownPlans.map( ( plan ) => {
					const discountedPriceFull =
						plan.orig_cost_integer !== plan.raw_price_integer ? plan.raw_price_integer : null;

					return [
						plan.product_slug,
						{
							planSlug: plan.product_slug,
							productSlug: plan.product_slug,
							productId: plan.product_id,
							pathSlug: plan.path_slug,
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
