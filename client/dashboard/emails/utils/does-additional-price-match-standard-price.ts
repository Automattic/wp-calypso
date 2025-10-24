import { EmailCost, Product } from '@automattic/api-core';

export const doesAdditionalPriceMatchStandardPrice = (
	mailProduct: Product,
	purchaseCost: EmailCost
): boolean => {
	return (
		purchaseCost.amount === mailProduct.cost && purchaseCost.currency === mailProduct.currency_code
	);
};
