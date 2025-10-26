import { Domain, Product } from '@automattic/api-core';
import { doesAdditionalPriceMatchStandardPrice } from './does-additional-price-match-standard-price';
import { isDomainEligibleForTitanIntroductoryOffer } from './is-domain-eligible-for-titan-introductory-offer';
import { isUserOnTitanFreeTrial } from './is-user-on-titan-free-trial';

export const getTotalCost = ( {
	amount,
	domain,
	product,
}: {
	amount: number;
	domain: Domain;
	product: Product;
} ) => {
	const purchaseCost = domain.titan_mail_subscription?.purchase_cost_per_mailbox;

	if ( purchaseCost && doesAdditionalPriceMatchStandardPrice( product, purchaseCost ) ) {
		return amount * purchaseCost.amount;
	}

	if (
		isUserOnTitanFreeTrial( domain ) ||
		isDomainEligibleForTitanIntroductoryOffer( { domain, product } )
	) {
		return 0;
	}

	return amount * product.cost;
};
