import usePricedAPISitePlans from '../queries/use-priced-api-site-plans';
import { PricedAPISitePlan, PlanIntroductoryOffer } from '../types';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	siteId: string | number | undefined;
	planSlugs: PlanSlug[];
}

const unpackAPIIntroOffer = ( sitePlan: PricedAPISitePlan ): PlanIntroductoryOffer | null => {
	// these aren't grouped or separated. so no introductory offer if no cost or interval
	if (
		! sitePlan.introductory_offer_raw_price &&
		! sitePlan.introductory_offer_interval_unit &&
		! sitePlan.introductory_offer_interval_count
	) {
		return null;
	}

	return {
		formattedPrice: sitePlan.introductory_offer_formatted_price,
		rawPrice: sitePlan.introductory_offer_raw_price,
		intervalUnit: sitePlan.introductory_offer_interval_unit,
		intervalCount: sitePlan.introductory_offer_interval_count,
	};
};

/**
 * Hook to get introductory offers for a list of plans
 *
 * @returns {Object | null} - an object with keys matching the planSlugs, and values being the introductory offer for that plan
 * or null if we haven't observed any metadata yet
 */
const useIntroOffers = ( {
	siteId,
	planSlugs,
}: Props ): { [ planSlug: string ]: PlanIntroductoryOffer | null } | null => {
	const sitePlans = usePricedAPISitePlans( siteId );

	if ( sitePlans.isFetching ) {
		return null;
	}

	const planObjects = Object.values( sitePlans.data ?? {} );

	// can memoize this if needed
	const introOffers = planSlugs.reduce( ( acc, planSlug ) => {
		const planObject = planObjects.find( ( plan ) => plan?.product_slug === planSlug );

		return {
			...acc,
			[ planSlug ]: planObject ? unpackAPIIntroOffer( planObject ) : null,
		};
	}, {} as { [ key: string ]: PlanIntroductoryOffer | null } );

	return introOffers;
};

export default useIntroOffers;
