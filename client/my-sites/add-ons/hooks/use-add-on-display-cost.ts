import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getProductCurrencyCode, getProductBySlug } from 'calypso/state/products-list/selectors';

const useAddOnDisplayCost = ( productSlug: string, quantity?: number ) => {
	const translate = useTranslate();

	return useSelector( ( state ) => {
		const product = getProductBySlug( state, productSlug );
		let cost = product?.cost;
		const currencyCode = getProductCurrencyCode( state, productSlug );

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

		const monthlyCost = formatCurrency( cost / 12, currencyCode, {
			stripZeros: true,
		} );

		return translate( '%(monthlyCost)s monthly, billed yearly', {
			/* Translators: $montlyCost: monthly price formatted with currency */
			args: {
				monthlyCost,
			},
		} );
	} );
};

export default useAddOnDisplayCost;
