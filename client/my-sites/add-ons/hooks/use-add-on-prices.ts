import formatCurrency from '@automattic/format-currency';
import { useSelector } from 'calypso/state';
import { getProductCurrencyCode, getProductBySlug } from 'calypso/state/products-list/selectors';

const useAddOnPrices = ( productSlug: string, quantity?: number ) => {
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

		let monthlyPrice = cost / 12;
		let yearlyPrice = cost;

		if ( product?.product_term === 'month' ) {
			monthlyPrice = cost;
			yearlyPrice = cost * 12;
		}

		return {
			monthlyPrice,
			yearlyPrice,
			formattedMonthlyPrice: formatCurrency( monthlyPrice, currencyCode, {
				stripZeros: true,
			} ),
			formattedYearlyPrice: formatCurrency( yearlyPrice, currencyCode, {
				stripZeros: true,
			} ),
		};
	} );
};

export default useAddOnPrices;
