import formatCurrency from '@automattic/format-currency';
import { useMemo } from '@wordpress/element';
import * as ProductsList from '../../products-list';

export type AddOnPriceKey = {
	productSlug: ProductsList.StoreProductSlug;
	quantity?: number;
};

type AddOnPrices = {
	[ key in string ]?: {
		monthlyPrice: number;
		yearlyPrice: number;
		formattedMonthlyPrice: string;
		formattedYearlyPrice: string;
	} | null;
};

export const getAddOnPriceKey = ( { productSlug, quantity }: AddOnPriceKey ) => {
	return `${ productSlug }_${ quantity ?? 0 }`;
};

export const useAddOnPrices = ( priceKeys: AddOnPriceKey[] ) => {
	const productSlugs = priceKeys.map( ( { productSlug } ) => productSlug );
	const productsList = ProductsList.useProducts( productSlugs );

	return useMemo( () => {
		return priceKeys.reduce< AddOnPrices >( ( accum, priceKey ) => {
			const { productSlug, quantity } = priceKey;
			const product = productsList.data?.[ productSlug ];
			let cost = product?.costSmallestUnit;

			if ( ! cost || ! product?.currencyCode ) {
				return {
					[ productSlug ]: null,
					...accum,
				};
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

			// Although memoized, it appears that add-on prices are unnecessarily recalculated dozens of
			// times when invoked as part of the PlansFeaturesMain component.
			//
			// When we format the cost before displaying it to the end user, the formatting library warns us
			// that it will round decimal values for smallest currency unit calculations. Because of the
			// unnecessary recalculations, this warning is repeated and floods the console.
			//
			// The ideal answer is to trace the root cause of the recalculations and prevent them, but after
			// taking a cursory look, it seems as if this will require deeper investigation. For now, because
			// we are always working with smallest currency units for add-ons, we explicitly round decimal add-on
			// monthly prices to suppress the warnings ( something that was already happening in the library ).
			//
			// Once https://github.com/Automattic/wp-calypso/issues/95416 is resolved, we can remove this rounding.
			const initialMonthlyPrice = cost / 12;
			let monthlyPrice = Number.isInteger( initialMonthlyPrice )
				? initialMonthlyPrice
				: Math.round( initialMonthlyPrice );
			let yearlyPrice = cost;

			if ( product?.term === 'month' ) {
				monthlyPrice = cost;
				yearlyPrice = cost * 12;
			}

			return {
				[ getAddOnPriceKey( priceKey ) ]: {
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
				},
				...accum,
			};
		}, {} );
	}, [ productsList ] );
};

export default useAddOnPrices;
