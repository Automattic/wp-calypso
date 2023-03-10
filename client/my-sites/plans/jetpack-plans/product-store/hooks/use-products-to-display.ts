import { JETPACK_CRM_PRODUCTS } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { MOST_POPULAR_PRODUCTS } from '../../constants';
import { getProductsToDisplay } from '../../product-grid/utils';
import slugToSelectorProduct from '../../slug-to-selector-product';
import { SelectorProduct } from '../../types';
import useGetPlansGridProducts from '../../use-get-plans-grid-products';
import { ItemToDisplayProps } from '../types';
import { isolatePopularItems } from '../utils/isolate-popular-items';

export const useProductsToDisplay = ( { siteId, duration }: ItemToDisplayProps ) => {
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );

	return useMemo( () => {
		const crmPurchasedOrIncluded = [ ...purchasedProducts, ...includedInPlanProducts ]
			.filter( ( p ) => Boolean( p?.productSlug ) )
			.some( ( p ) =>
				( JETPACK_CRM_PRODUCTS as ReadonlyArray< string > ).includes( p.productSlug )
			);

		const allAvailableProducts: SelectorProduct[] = [ ...availableProducts ];

		// Guard against double-including CRM in the list of products
		if ( ! crmPurchasedOrIncluded ) {
			const externalCrmProducts = JETPACK_CRM_PRODUCTS.map(
				slugToSelectorProduct
			) as SelectorProduct[];

			allAvailableProducts.push( ...externalCrmProducts );
		}

		const allItems = getProductsToDisplay( {
			duration,
			availableProducts: allAvailableProducts,
			purchasedProducts,
			includedInPlanProducts,
		} );

		return isolatePopularItems( allItems, MOST_POPULAR_PRODUCTS );
	}, [ duration, availableProducts, purchasedProducts, includedInPlanProducts ] );
};
