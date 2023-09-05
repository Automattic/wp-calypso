import { useMemo } from '@wordpress/element';
import usePricedAPISitePlans from '../queries/use-priced-api-site-plans';
import type { PlanIntroductoryOffer, PricedAPISitePlan } from '../types';

interface IntroOffersIndex {
	[ planSlug: string ]: PlanIntroductoryOffer | null;
}

interface Props {
	siteId?: string | number | null;
}

const unpackIntroOffer = ( sitePlan: PricedAPISitePlan ): PlanIntroductoryOffer | null => {
	// these aren't grouped or separated. so no introductory offer if no cost or interval
	if (
		! sitePlan.introductory_offer_interval_unit &&
		! sitePlan.introductory_offer_interval_count
	) {
		return null;
	}

	return {
		formattedPrice: sitePlan.introductory_offer_formatted_price as string,
		rawPrice: sitePlan.introductory_offer_raw_price as number,
		intervalUnit: sitePlan.introductory_offer_interval_unit as string,
		intervalCount: sitePlan.introductory_offer_interval_count as number,
	};
};

/**
 * Get introductory offers for plans that have these defined
 *  - Currently retrieved off site-plans: https://public-api.wordpress.com/rest/v1.3/sites/[siteId]/plans
 *  - Can be extended to include /plans endpoint
 *
 * @returns {IntroOffersIndex | null} - an object of planSlug->PlanIntroductoryOffer, or null if we haven't observed any metadata yet
 */
const useIntroOffers = ( { siteId }: Props ): IntroOffersIndex | null => {
	const sitePlans = usePricedAPISitePlans( { siteId } );

	return useMemo( () => {
		if ( ! sitePlans.data ) {
			return null;
		}

		return Object.values( sitePlans?.data ).reduce< IntroOffersIndex >( ( acc, plan ) => {
			const introOffer = unpackIntroOffer( plan );
			return {
				...acc,
				...( introOffer && { [ plan.product_slug ]: introOffer } ),
			};
		}, {} );
	}, [ sitePlans.data ] );
};

export default useIntroOffers;
