import usePricedAPISitePlans from '../queries/use-priced-api-site-plans';
import { PricedAPISitePlan, PlanIntroductoryOffer } from '../types';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	siteId: string | number | undefined;
	planSlugs: PlanSlug[];
}

const unpackAPIIntroOffer = ( sitePlan: PricedAPISitePlan ): PlanIntroductoryOffer | null => {
	// these aren't grouped or separated. so no introductory offer if no cost or interval
	if ( ! sitePlan.cost_per_interval && ! sitePlan.interval_count && ! sitePlan.interval_unit ) {
		return null;
	}

	return {
		costPerInterval: sitePlan.cost_per_interval,
		intervalCount: sitePlan.interval_count,
		intervalUnit: sitePlan.interval_unit,
		shouldProrateWhenOfferEnds: sitePlan.should_prorate_when_offer_ends,
		transitionAfterRenewalCount: sitePlan.transition_after_renewal_count,
		usageLimit: sitePlan.usage_limit,
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
