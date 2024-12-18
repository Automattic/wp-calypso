import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_CUSTOM_DESIGN,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
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
import useAddOnPrices from './use-add-on-prices';
import type { AddOnMeta } from '../types';

const useActiveAddOnsDefs = ( selectedSiteId: Props[ 'selectedSiteId' ] ) => {
	const translate = useTranslate();
	const checkoutLink = useAddOnCheckoutLink();

	/*
	 * TODO: `useAddOnDisplayCost` be refactored instead to return an index of `{ [ slug ]: "display cost" }`
	 */
	const displayCostUnlimitedThemes = useAddOnDisplayCost( PRODUCT_WPCOM_UNLIMITED_THEMES );
	const displayCostCustomDesign = useAddOnDisplayCost( PRODUCT_WPCOM_CUSTOM_DESIGN );
	const displayCost1GBSpace50 = useAddOnDisplayCost( PRODUCT_1GB_SPACE, 50 );
	const displayCost1GBSpace100 = useAddOnDisplayCost( PRODUCT_1GB_SPACE, 100 );

	/*
	 * TODO: `useAddOnPrices` be refactored instead to return an index of `{ [ slug ]: AddOnPrice }`
	 */
	const addOnPrices1GBSpace50 = useAddOnPrices( PRODUCT_1GB_SPACE, 50 );
	const addOnPrices1GBSpace100 = useAddOnPrices( PRODUCT_1GB_SPACE, 100 );

	return useMemo(
		() =>
			[
				{
					addOnSlug: ADD_ON_UNLIMITED_THEMES,
					productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
					featureSlugs: [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ] as string[],
					icon: unlimitedThemesIcon,
					overrides: null,
					displayCost: displayCostUnlimitedThemes,
					featured: true,
					name: undefined,
					description: undefined,
				},
				{
					addOnSlug: ADD_ON_CUSTOM_DESIGN,
					productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
					featureSlugs: [ WPCOM_FEATURES_CUSTOM_DESIGN ] as string[],
					icon: customDesignIcon,
					overrides: null,
					displayCost: displayCostCustomDesign,
					featured: false,
					name: undefined,
					description: undefined,
				},
				{
					addOnSlug: ADD_ON_50GB_STORAGE,
					productSlug: PRODUCT_1GB_SPACE,
					featureSlugs: null,
					icon: spaceUpgradeIcon,
					quantity: 50,
					name: translate( '50 GB Storage' ),
					displayCost: displayCost1GBSpace50,
					prices: addOnPrices1GBSpace50,
					description: translate(
						'Make more space for high-quality photos, videos, and other media. '
					),
					featured: false,
					checkoutLink: checkoutLink( selectedSiteId ?? null, PRODUCT_1GB_SPACE, 50 ),
				},
				{
					addOnSlug: ADD_ON_100GB_STORAGE,
					productSlug: PRODUCT_1GB_SPACE,
					featureSlugs: null,
					icon: spaceUpgradeIcon,
					quantity: 100,
					name: translate( '100 GB Storage' ),
					displayCost: displayCost1GBSpace100,
					prices: addOnPrices1GBSpace100,
					description: translate(
						'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
					),
					featured: false,
					checkoutLink: checkoutLink( selectedSiteId ?? null, PRODUCT_1GB_SPACE, 100 ),
				},
			] as const,
		[
			addOnPrices1GBSpace100,
			addOnPrices1GBSpace50,
			checkoutLink,
			displayCost1GBSpace100,
			displayCost1GBSpace50,
			displayCostCustomDesign,
			displayCostUnlimitedThemes,
			selectedSiteId,
			translate,
		]
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
