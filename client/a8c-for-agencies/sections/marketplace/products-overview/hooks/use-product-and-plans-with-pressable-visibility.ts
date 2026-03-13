import { useMemo } from 'react';
import useProductAndPlans from '../../hooks/use-product-and-plans';

type Args = Parameters< typeof useProductAndPlans >[ 0 ];

export default function useProductAndPlansWithPressableVisibility(
	args: Args,
	canShowPressableAddons: boolean
) {
	const products = useProductAndPlans( args );

	return useMemo( () => {
		if ( canShowPressableAddons || ! products.pressableAddons.length ) {
			return products;
		}

		const pressableAddonProductIds = new Set(
			products.pressableAddons.map( ( product ) => product.product_id )
		);

		return {
			...products,
			filteredProductsAndBundles: products.filteredProductsAndBundles.filter(
				( product ) => ! pressableAddonProductIds.has( product.product_id )
			),
			pressableAddons: [],
		};
	}, [ canShowPressableAddons, products ] );
}
