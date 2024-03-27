import formatCurrency from '@automattic/format-currency';
import { useMemo } from '@wordpress/element';
import * as ProductsList from '../../products-list';

const useAddOnPrices = ( productSlug: ProductsList.StoreProductSlug, quantity?: number ) => {
	const productsList = ProductsList.useProducts( [ productSlug ] );
	const product = productsList.data?.[ productSlug ];

	return useMemo( () => {
		let cost = product?.costSmallestUnit;

		if ( ! cost || ! product?.currencyCode ) {
			return null;
		}

		// Finds the applicable tiered price for the quantity.
		const priceTier =
			quantity &&
			product?.priceTierList.find( ( tier ) => {
				if ( quantity >= tier.minimumUnits && quantity <= ( tier.maximumUnits ?? 0 ) ) {
					return tier;
				}
			} );

		if ( priceTier ) {
			cost = priceTier?.maximumPrice;
		}

		let monthlyPrice = cost / 12;
		let yearlyPrice = cost;

		if ( product?.term === 'month' ) {
			monthlyPrice = cost;
			yearlyPrice = cost * 12;
		}

		return {
			monthlyPrice,
			yearlyPrice,
			formattedMonthlyPrice: formatCurrency( monthlyPrice, product?.currencyCode, {
				stripZeros: true,
				isSmallestUnit: true,
			} ),
			formattedYearlyPrice: formatCurrency( yearlyPrice, product?.currencyCode, {
				stripZeros: true,
				isSmallestUnit: true,
			} ),
		};
	}, [ product, quantity ] );
};

export default useAddOnPrices;
