import { JETPACK_PRODUCTS_INCLUDED_IN_PLAN_MAP } from '@automattic/calypso-products';
import { useMemo } from 'react';
import slugToSelectorProduct from '../slug-to-selector-product';
import { RenderPrice } from './render-price';
import { PricingBreakdownItem, PricingBreakdownProps } from './types';
import { useGetOriginalPrice } from './use-get-original-price';

export const usePricingBreakdown = ( { product, siteId }: PricingBreakdownProps ) => {
	const productSlug = product.productSlug as keyof typeof JETPACK_PRODUCTS_INCLUDED_IN_PLAN_MAP;

	const includedProductSlugs = JETPACK_PRODUCTS_INCLUDED_IN_PLAN_MAP[ productSlug ];

	const getOriginalPrice = useGetOriginalPrice( siteId );

	return useMemo( () => {
		const items: Array< PricingBreakdownItem > = [];
		let total = 0;

		if ( ! includedProductSlugs.length ) {
			return { items, total };
		}

		for ( const slug of includedProductSlugs ) {
			const selectorProduct = slugToSelectorProduct( slug );

			if ( ! selectorProduct ) {
				continue;
			}

			const originalPrice = getOriginalPrice( selectorProduct );

			total += originalPrice;

			items.push( {
				name: selectorProduct?.displayName,
				slug,
				originalPrice,
				renderedPrice: <RenderPrice price={ originalPrice } />,
			} );
		}

		return { items, total };
	}, [ getOriginalPrice, includedProductSlugs ] );
};
