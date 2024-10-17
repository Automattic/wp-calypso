import type { PlanIntroductoryOffer, PricedAPIPlan, PricedAPISitePlan } from '../../types';

/**
 * Unpacks an intro offer from an API plan to the respective `PlanIntroductoryOffer` structure for the store.
 */
const unpackIntroOffer = (
	plan: PricedAPISitePlan | PricedAPIPlan
): PlanIntroductoryOffer | null => {
	// these aren't grouped or separated. so no introductory offer if missing or malformed raw_price
	if (
		typeof plan.introductory_offer_raw_price_integer !== 'number' ||
		! plan.introductory_offer_interval_count
	) {
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
		rawPrice: {
			monthly:
				/**
				 * IMPORTANT:
				 * we make the raw assumption that the interval unit is either "year" or "month"
				 * to compute monthly/full price
				 */
				'year' === plan.introductory_offer_interval_unit
					? parseFloat(
							(
								plan.introductory_offer_raw_price_integer /
								( plan.introductory_offer_interval_count * 12 )
							).toFixed( 2 )
					  )
					: plan.introductory_offer_raw_price_integer,
			full: plan.introductory_offer_raw_price_integer,
		},
		intervalUnit: plan.introductory_offer_interval_unit as string,
		intervalCount: plan.introductory_offer_interval_count,
		isOfferComplete,
	};
};

export default unpackIntroOffer;
