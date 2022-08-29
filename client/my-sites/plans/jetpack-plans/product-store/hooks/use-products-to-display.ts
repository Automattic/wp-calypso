import { useMemo } from 'react';
import { MOST_POPULAR_PRODUCTS } from '../../constants';
import { getProductsToDisplay } from '../../product-grid/utils';
import useGetPlansGridProducts from '../../use-get-plans-grid-products';
import { ProductsListProps } from '../types';
import { isolatePopularItems } from '../utils/isolate-popular-items';

export const useProductsToDisplay = ( { siteId, duration }: ProductsListProps ) => {
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );

	return useMemo( () => {
		const allItems = getProductsToDisplay( {
			duration,
			availableProducts,
			purchasedProducts,
			includedInPlanProducts,
		} );

		return isolatePopularItems( allItems, MOST_POPULAR_PRODUCTS );
	}, [ duration, availableProducts, purchasedProducts, includedInPlanProducts ] );
};
