import { Domain, Product } from '@automattic/api-core';
import { doesAdditionalPriceMatchStandardPrice } from './does-additional-price-match-standard-price';
import { getEmailSubscription } from './get-email-subscription';
import { isEligibleForIntroductoryOffer } from './is-eligible-for-introductory-offer';
import { isUserOnFreeTrial } from './is-user-on-free-trial';

export const getTotalCost = ( {
	amount,
	domain,
	product,
}: {
	amount: number;
	domain: Domain;
	product: Product;
} ) => {
	const emailSubscription = getEmailSubscription( { domain, product } );

	const purchaseCost = emailSubscription?.purchase_cost_per_mailbox;

	if ( purchaseCost && doesAdditionalPriceMatchStandardPrice( product, purchaseCost ) ) {
		return amount * purchaseCost.amount;
	}

	if (
		isUserOnFreeTrial( emailSubscription ) ||
		isEligibleForIntroductoryOffer( { emailSubscription, product } )
	) {
		return 0;
	}

	return amount * product.cost;
};
