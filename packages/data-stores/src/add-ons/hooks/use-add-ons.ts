import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_CUSTOM_DESIGN,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import i18n from 'i18n-calypso';
import * as ProductsList from '../../products-list';
import * as Site from '../../site';
import {
	ADD_ON_100GB_STORAGE,
	ADD_ON_50GB_STORAGE,
	ADD_ON_CUSTOM_DESIGN,
	ADD_ON_UNLIMITED_THEMES,
} from '../constants';
import customDesignIcon from '../icons/custom-design';
import spaceUpgradeIcon from '../icons/space-upgrade';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import useAddOnCheckoutLink from './use-add-on-checkout-link';
import useAddOnDisplayCost from './use-add-on-display-cost';
import { getAddOnPriceKey, useAddOnPrices } from './use-add-on-prices';
import type { AddOnMeta } from '../types';

const getActiveAddOns = (): AddOnMeta[] => {
	return [
		{
			addOnSlug: ADD_ON_UNLIMITED_THEMES,
			productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
			featureSlugs: [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ] as string[],
			icon: unlimitedThemesIcon,
			featured: true,
		},
		{
			addOnSlug: ADD_ON_CUSTOM_DESIGN,
			productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
			featureSlugs: [ WPCOM_FEATURES_CUSTOM_DESIGN ] as string[],
			icon: customDesignIcon,
		},
		{
			addOnSlug: ADD_ON_50GB_STORAGE,
			productSlug: PRODUCT_1GB_SPACE,
			featureSlugs: null,
			icon: spaceUpgradeIcon,
			quantity: 50,
			name: i18n.translate( '50 GB Storage' ),
			description: i18n.translate(
				'Make more space for high-quality photos, videos, and other media. '
			),
		},
		{
			addOnSlug: ADD_ON_100GB_STORAGE,
			productSlug: PRODUCT_1GB_SPACE,
			featureSlugs: null,
			icon: spaceUpgradeIcon,
			quantity: 100,
			name: i18n.translate( '100 GB Storage' ),
			description: i18n.translate(
				'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
			),
		},
	];
};

const useActiveAddOnsDefs = ( selectedSiteId: Props[ 'selectedSiteId' ] ) => {
	const checkoutLink = useAddOnCheckoutLink();
	const activeAddOns = getActiveAddOns();
	const addOnPriceKeys = activeAddOns.map( ( { productSlug, quantity } ) => ( {
		productSlug,
		quantity,
	} ) );
	const addOnPrices = useAddOnPrices( addOnPriceKeys );
	const addOnDisplayCosts = useAddOnDisplayCost( addOnPriceKeys );

	return useMemo(
		() =>
			activeAddOns.map( ( addOnMeta ) => {
				const { productSlug, quantity } = addOnMeta;
				const key = getAddOnPriceKey( { productSlug, quantity } );
				return {
					prices: addOnPrices[ key ],
					displayCost: addOnDisplayCosts[ key ],
					...( !! quantity && {
						checkoutLink: checkoutLink( selectedSiteId ?? null, productSlug, quantity ),
					} ),
					...addOnMeta,
				};
			} ),
		[ addOnPrices, addOnPriceKeys, addOnDisplayCosts, checkoutLink, selectedSiteId ]
	);
};

interface Props {
	selectedSiteId?: number | null | undefined;
}

const useAddOns = ( { selectedSiteId }: Props = {} ): ( AddOnMeta | null )[] => {
	const activeAddOns = useActiveAddOnsDefs( selectedSiteId );
	const productSlugs = activeAddOns.map( ( item ) => item.productSlug );
	const productsList = ProductsList.useProducts( productSlugs );
	const mediaStorage = Site.useSiteMediaStorage( { siteIdOrSlug: selectedSiteId } );

	return useMemo(
		() =>
			activeAddOns.map( ( addOn ) => {
				const product = productsList.data?.[ addOn.productSlug ];
				const name = addOn.name ? addOn.name : product?.name || '';
				const description = addOn.description ?? ( product?.description || '' );

				/**
				 * If data required by the `/add-ons` page is still loading, show the add-on as loading.
				 * TODO: Potentially another candidate for migrating to `use-add-on-purchase-status`, and attach
				 * that to the add-on's meta if need to.
				 */
				if ( productsList.isLoading || mediaStorage.isLoading ) {
					return {
						...addOn,
						name,
						description,
						isLoading: true,
					};
				}

				/**
				 * If the product is not found in the products list, remove the add-on.
				 * This should signal a wrong slug or a product that doesn't exist i.e. some sort of Bug.
				 * (not sure if add-on without a connected product is a valid use case)
				 */
				if ( ! product ) {
					return null;
				}

				/**
				 * Regular product add-ons.
				 */
				return {
					...addOn,
					name,
					description,
				};
			} ),
		[ activeAddOns, mediaStorage.isLoading, productsList.data, productsList.isLoading ]
	);
};

export default useAddOns;
