import { useMemo } from 'react';
import slugToSelectorProduct from '../slug-to-selector-product';
import { RenderPrice } from './render-price';
import { PricingBreakdownItem, PricingBreakdownProps } from './types';
import { useGetOriginalPrice } from './use-get-original-price';

export const usePricingBreakdown = ( { includedProductSlugs, siteId }: PricingBreakdownProps ) => {
	const getOriginalPrice = useGetOriginalPrice( siteId );

	return useMemo( () => {
		const items: Array< PricingBreakdownItem > = [];
		let total = 0;

		if ( ! includedProductSlugs?.length ) {
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
