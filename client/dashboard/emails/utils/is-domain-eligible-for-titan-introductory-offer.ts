import { Domain, Product } from '@automattic/api-core';

export const isDomainEligibleForTitanIntroductoryOffer = ( {
	domain,
	product,
}: {
	domain: Domain;
	product: Product;
} ) => {
	return !! (
		domain.titan_mail_subscription?.is_eligible_for_introductory_offer &&
		product.introductory_offer &&
		product.introductory_offer.cost_per_interval === 0 &&
		product.introductory_offer.interval_count > 0 &&
		product.introductory_offer?.interval_unit
	);
};
