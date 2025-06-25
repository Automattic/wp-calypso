import { TERM_MONTHLY, JETPACK_CRM_PRODUCTS } from '@automattic/calypso-products';
import { useCallback } from 'react';
import { useStore } from 'calypso/state';
import { getProductCost } from 'calypso/state/products-list/selectors';
import { getSiteAvailableProductCost } from 'calypso/state/sites/products/selectors';
import { SelectorProduct } from '../../types';

const getMonthlyPrice = ( yearlyPrice: number ): number => ( yearlyPrice * 100 ) / 12 / 100;

export const useGetOriginalPrice = ( siteId: number | null ) => {
	const store = useStore();

	return useCallback(
		( product: SelectorProduct ) => {
			// Jetpack CRM price won't come from the API, so we need to hard-code it for now.
			if (
				JETPACK_CRM_PRODUCTS.includes(
					product.productSlug as ( typeof JETPACK_CRM_PRODUCTS )[ number ]
				)
			) {
				return product.displayPrice || -1;
			}

			const productSlug = product.costProductSlug || product.productSlug;

			const state = store.getState();
			const sitePricesItemCost =
				siteId && productSlug && getSiteAvailableProductCost( state, siteId, productSlug );
			const listPricesItemCost = productSlug && getProductCost( state, productSlug );

			const itemCost = siteId ? sitePricesItemCost : listPricesItemCost;

			let originalPrice = itemCost;
			if ( product.term !== TERM_MONTHLY ) {
				originalPrice = getMonthlyPrice( itemCost );
			}

			return originalPrice;
		},
		[ siteId, store ]
	);
};
