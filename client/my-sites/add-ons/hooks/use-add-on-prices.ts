import formatCurrency from '@automattic/format-currency';
import { useMemo } from '@wordpress/element';
import { useSelector } from 'calypso/state';
import { getProductCurrencyCode, getProductBySlug } from 'calypso/state/products-list/selectors';

const useAddOnPrices = ( productSlug: string, quantity?: number ) => {
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );
	const currencyCode = useSelector( ( state ) => getProductCurrencyCode( state, productSlug ) );

	return useMemo( () => {
		let cost = product?.cost_smallest_unit;
		if ( ! cost || ! currencyCode ) {
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
			cost = priceTier?.maximum_price;
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
				isSmallestUnit: true,
			} ),
			formattedYearlyPrice: formatCurrency( yearlyPrice, currencyCode, {
				stripZeros: true,
				isSmallestUnit: true,
			} ),
		};
	}, [ product, currencyCode, quantity ] );
};

export default useAddOnPrices;
