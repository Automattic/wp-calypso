import { JETPACK_BOOST_PRODUCTS, JETPACK_CRM_PRODUCTS } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { MOST_POPULAR_PRODUCTS } from '../../constants';
import { getProductsToDisplay } from '../../product-grid/utils';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';
import useGetPlansGridProducts from '../../use-get-plans-grid-products';
import { ProductsListProps } from '../types';
import { isolatePopularItems } from '../utils/isolate-popular-items';

export const useProductsToDisplay = ( { siteId, duration }: ProductsListProps ) => {
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );

	const allAvailableProducts = useMemo( () => {
		// TODO - need to add Jetpack social product constants and data
		const moreAvailableProducts = [ ...JETPACK_BOOST_PRODUCTS, ...JETPACK_CRM_PRODUCTS ].map(
			slugToSelectorProduct
		) as SelectorProduct[];

		return [ ...availableProducts, ...moreAvailableProducts ] as SelectorProduct[];
	}, [ availableProducts ] );

	return useMemo( () => {
		const allItems = getProductsToDisplay( {
			duration,
			availableProducts: allAvailableProducts,
			purchasedProducts,
			includedInPlanProducts,
		} );

		return isolatePopularItems( allItems, MOST_POPULAR_PRODUCTS );
	}, [ duration, allAvailableProducts, purchasedProducts, includedInPlanProducts ] );
};
