import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import * as ProductsList from '../../products-list';
import * as Site from '../../site';
import { getAddOnsList } from '../add-ons-list';
import useAddOnCheckoutLink from './use-add-on-checkout-link';
import { createAddOnPriceKey, useAddOnPrices } from './use-add-on-prices';
import type { AddOnMeta } from '../types';

interface Props {
	selectedSiteId?: number | null | undefined;
}

const useAddOns = ( { selectedSiteId }: Props = {} ): ( AddOnMeta | null )[] => {
	const translate = useTranslate();
	const checkoutLink = useAddOnCheckoutLink();
	const addOns = getAddOnsList();
	const addOnPrices = useAddOnPrices( addOns );
	const productSlugs = addOns.map( ( item ) => item.productSlug );
	const productsList = ProductsList.useProducts( productSlugs );
	const mediaStorage = Site.useSiteMediaStorage( { siteIdOrSlug: selectedSiteId } );

	return useMemo(
		() =>
			addOns.map( ( addOnMeta ) => {
				const { productSlug, quantity } = addOnMeta;
				const key = createAddOnPriceKey( addOnMeta );

				// TODO: can we not specify the product slug here for the storage add-on?
				const isLoading =
					productsList.isLoading || ( productSlug === PRODUCT_1GB_SPACE && mediaStorage.isLoading );
				const product = productsList.data?.[ productSlug ];
				const name = addOnMeta.name ? addOnMeta.name : product?.name || '';
				const description = addOnMeta.description ?? ( product?.description || '' );

				/**
				 * If the product is not found in the products list, remove the add-on.
				 * This should signal a wrong slug or a product that doesn't exist i.e. some sort of Bug.
				 * (not sure if add-on without a connected product is a valid use case)
				 */
				if ( ! product ) {
					return null;
				}

				const prices = addOnPrices[ key ];
				const formattedCost = prices?.formattedMonthlyPrice || '';
				const displayCost =
					product.term === 'month'
						? /* Translators: %(formattedCost)s: monthly price formatted with currency */
						  translate( '%(formattedCost)s/month, billed monthly', {
								args: {
									formattedCost,
								},
						  } )
						: /* Translators: %(monthlyCost)s: monthly price formatted with currency */
						  translate( '%(monthlyCost)s/month, billed yearly', {
								args: {
									monthlyCost: formattedCost,
								},
						  } );

				return {
					...addOnMeta,
					name,
					description,
					isLoading,
					prices,
					displayCost,
					checkoutLink: checkoutLink( selectedSiteId ?? null, productSlug, quantity ),
				};
			} ),
		[ addOnPrices, productsList.data, productsList.isLoading, checkoutLink, selectedSiteId ]
	);
};

export default useAddOns;
