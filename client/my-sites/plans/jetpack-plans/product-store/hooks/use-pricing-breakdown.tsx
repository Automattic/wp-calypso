import { useMemo } from 'react';
import slugToSelectorProduct from '../../slug-to-selector-product';
import useItemPrice from '../../use-item-price';
import { RenderPrice } from '../pricing-breakdown/render-price';
import { PricingBreakdownItem, PricingBreakdownProps } from '../types';
import { useGetOriginalPrice } from './use-get-original-price';

export const usePricingBreakdown = ( {
	includedProductSlugs,
	product,
	siteId,
}: PricingBreakdownProps ) => {
	const getOriginalPrice = useGetOriginalPrice( siteId );

	const { originalPrice, discountedPrice, isFetching } = useItemPrice(
		siteId,
		product,
		product?.monthlyProductSlug || ''
	);

	const bundlePrice = discountedPrice || originalPrice || 0;

	return useMemo( () => {
		const items: Array< PricingBreakdownItem > = [];
		let total = 0;
		let amountSaved = 0;

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

		if ( total ) {
			amountSaved = Number( ( total - bundlePrice ).toFixed( 2 ) );
		}

		return { items, total, amountSaved, bundlePrice, isFetching };
	}, [ bundlePrice, getOriginalPrice, includedProductSlugs, isFetching ] );
};
