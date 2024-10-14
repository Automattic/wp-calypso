import type { PlanIntroductoryOffer, PricedAPIPlan, PricedAPISitePlan } from '../../types';

/**
 * Unpacks an intro offer from an API plan to the respective `PlanIntroductoryOffer` structure for the store.
 */
const unpackIntroOffer = (
	plan: PricedAPISitePlan | PricedAPIPlan
): PlanIntroductoryOffer | null => {
	// these aren't grouped or separated. so no introductory offer if no cost or interval
	if ( ! plan.introductory_offer_interval_unit && ! plan.introductory_offer_interval_count ) {
		return null;
	}

	/**
	 * An offer is complete if:
	 *   1. an expiry date is set on the plan that exceeds the offer end date, OR
	 *   2. the current Date exceeds the offer end date
	 */
	const isOfferComplete =
		'expiry' in plan
			? Boolean(
					plan.expiry &&
						plan.introductory_offer_end_date &&
						new Date( plan.expiry ) > new Date( plan.introductory_offer_end_date )
			  )
			: Boolean(
					plan.introductory_offer_end_date &&
						new Date() > new Date( plan.introductory_offer_end_date )
			  );

	return {
		formattedPrice: plan.introductory_offer_formatted_price as string,
		rawPrice: plan.introductory_offer_raw_price as number,
		rawPriceInteger: plan.introductory_offer_raw_price_integer as number,
		intervalUnit: plan.introductory_offer_interval_unit as string,
		intervalCount: plan.introductory_offer_interval_count as number,
		isOfferComplete,
	};
};

export default unpackIntroOffer;
