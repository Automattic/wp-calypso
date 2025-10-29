import { EmailSubscription, Product } from '@automattic/api-core';

export const isEligibleForIntroductoryOffer = ( {
	emailSubscription,
	product,
}: {
	emailSubscription?: EmailSubscription;
	product: Product;
} ) => {
	return !! (
		emailSubscription?.is_eligible_for_introductory_offer &&
		product.introductory_offer &&
		product.introductory_offer.cost_per_interval === 0 &&
		product.introductory_offer.interval_count > 0 &&
		product.introductory_offer?.interval_unit
	);
};
