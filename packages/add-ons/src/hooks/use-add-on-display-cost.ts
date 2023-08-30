import { ProductsListItem } from '@automattic/data-stores/src/products-list';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';

export const useAddOnDisplayCost = (
	product: ProductsListItem | null,
	currencyCode: string | null,
	quantity?: number
) => {
	const translate = useTranslate();

	let cost = product?.cost;

	if ( ! ( cost && currencyCode ) ) {
		return null;
	}

	// Finds the applicable tiered price for the quantity.
	const priceTier =
		quantity &&
		product?.price_tier_list.find( ( tier ) => {
			if ( quantity >= tier.minimum_units && quantity <= ( tier.maximum_units ?? 0 ) ) {
				return tier;
			}
		} );

	if ( priceTier ) {
		cost = priceTier?.maximum_price / 100;
	}

	if ( product?.product_term === 'month' ) {
		const formattedCost = formatCurrency( cost, currencyCode, {
			stripZeros: true,
		} );
		return translate( '%(formattedCost)s/month, billed monthly', {
			/* Translators: $formattedCost: monthly price formatted with currency */
			args: {
				formattedCost,
			},
		} );
	}

	const monthlyCost = formatCurrency( cost / 12, currencyCode, {
		stripZeros: true,
	} );

	return translate( '%(monthlyCost)s/month, billed yearly', {
		/* Translators: $montlyCost: monthly price formatted with currency */
		args: {
			monthlyCost,
		},
	} );
};
