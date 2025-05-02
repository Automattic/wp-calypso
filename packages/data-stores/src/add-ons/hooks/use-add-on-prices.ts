import { formatCurrency } from '@automattic/number-formatters';
import { useMemo } from '@wordpress/element';
import * as ProductsList from '../../products-list';
import type { AddOnMeta } from '../types';

type AddOnPrices = {
	[ key in string ]?: {
		monthlyPrice: number;
		yearlyPrice: number;
		formattedMonthlyPrice: string;
		formattedYearlyPrice: string;
		currencyCode: string;
	} | null;
};

export const createAddOnPriceKey = ( { productSlug, quantity }: AddOnMeta ) => {
	return `${ productSlug }_${ quantity ?? 0 }`;
};

export const useAddOnPrices = ( addOnMetas: AddOnMeta[] ) => {
	const productSlugs = useMemo(
		() => addOnMetas.map( ( { productSlug } ) => productSlug ),
		[ addOnMetas ]
	);
	const productsList = ProductsList.useProducts( productSlugs );

	return useMemo( () => {
		return addOnMetas.reduce< AddOnPrices >( ( accum, addOnMeta ) => {
			const { productSlug, quantity } = addOnMeta;
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

			let monthlyPrice = cost / 12;
			let yearlyPrice = cost;

			if ( product?.term === 'month' ) {
				monthlyPrice = cost;
				yearlyPrice = cost * 12;
			}

			return {
				[ createAddOnPriceKey( addOnMeta ) ]: {
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
					currencyCode: product?.currencyCode,
				},
				...accum,
			};
		}, {} );
	}, [ addOnMetas, productsList.data ] );
};

export default useAddOnPrices;
