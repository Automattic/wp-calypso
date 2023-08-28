import usePricedAPISitePlans from '../queries/use-priced-api-site-plans';
import { PricedAPISitePlan, PlanIntroductoryOffer } from '../types';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	siteId: string | number | undefined;
	planSlugs: PlanSlug[];
}

const packIntroOffer = ( sitePlan: PricedAPISitePlan ): PlanIntroductoryOffer | null => {
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

const useIntroOffers = ( { siteId, planSlugs }: Props ) => {
	const sitePlans = usePricedAPISitePlans( siteId );

	if ( sitePlans.isFetching ) {
		return {
			processing: true,
			introOffers: undefined, // undefined -> we haven't observed any metadata yet
		};
	}

	const planObjects = Object.values( sitePlans.data ?? {} );

	// can momoize this if needed
	const introOffers = planSlugs.reduce( ( acc, planSlug ) => {
		const planObject = planObjects.find( ( plan ) => plan?.product_slug === planSlug );

		return {
			...acc,
			[ planSlug ]: planObject ? packIntroOffer( planObject ) : null,
		};
	}, {} as { [ key: string ]: PlanIntroductoryOffer | null } );

	return {
		processing: false,
		introOffers: introOffers,
	};
};

export default useIntroOffers;
