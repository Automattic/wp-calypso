import {
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_AI_ASSISTANT,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import * as ProductsList from '../../products-list';
import * as Purchases from '../../purchases';
import * as Site from '../../site';
import { STORAGE_LIMIT } from '../constants';
import customDesignIcon from '../icons/custom-design';
import jetpackAIIcon from '../icons/jetpack-ai';
import spaceUpgradeIcon from '../icons/space-upgrade';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import isStorageAddonEnabled from '../lib/is-storage-addon-enabled';
import useAddOnCheckoutLink from './use-add-on-checkout-link';
import useAddOnDisplayCost from './use-add-on-display-cost';
import useAddOnFeatureSlugs from './use-add-on-feature-slugs';
import useAddOnPrices from './use-add-on-prices';
import type { AddOnMeta } from '../types';

const useActiveAddOnsDefs = ( selectedSiteId: Props[ 'selectedSiteId' ] ) => {
	const translate = useTranslate();
	const checkoutLink = useAddOnCheckoutLink();

	/*
	 * TODO: `useAddOnFeatureSlugs` be refactored instead to return an index of `{ [ slug ]: featureSlug[] }`
	 */
	const featureSlugsJetpackAIMonthly = useAddOnFeatureSlugs( PRODUCT_JETPACK_AI_MONTHLY );
	const featureSlugsUnlimitedThemes = useAddOnFeatureSlugs( PRODUCT_WPCOM_UNLIMITED_THEMES );
	const featureSlugsCustomDesign = useAddOnFeatureSlugs( PRODUCT_WPCOM_CUSTOM_DESIGN );
	const featureSlugs1GBSpace50 = useAddOnFeatureSlugs( PRODUCT_1GB_SPACE, 50 );
	const featureSlugs1GBSpace100 = useAddOnFeatureSlugs( PRODUCT_1GB_SPACE, 100 );

	/*
	 * TODO: `useAddOnDisplayCost` be refactored instead to return an index of `{ [ slug ]: "display cost" }`
	 */
	const displayCostJetpackAIMonthly = useAddOnDisplayCost( PRODUCT_JETPACK_AI_MONTHLY );
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
					productSlug: PRODUCT_JETPACK_AI_MONTHLY,
					featureSlugs: featureSlugsJetpackAIMonthly,
					icon: jetpackAIIcon,
					overrides: null,
					displayCost: displayCostJetpackAIMonthly,
					featured: true,
					description: translate(
						'Elevate your content with Jetpack AI, your AI assistant in the WordPress Editor. Save time writing with effortless content crafting, tone adjustment, title generation, grammar checks, translation, and more.'
					),
					name: undefined,
				},
				{
					productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
					featureSlugs: featureSlugsUnlimitedThemes,
					icon: unlimitedThemesIcon,
					overrides: null,
					displayCost: displayCostUnlimitedThemes,
					featured: true,
					name: undefined,
					description: undefined,
				},
				{
					productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
					featureSlugs: featureSlugsCustomDesign,
					icon: customDesignIcon,
					overrides: null,
					displayCost: displayCostCustomDesign,
					featured: false,
					name: undefined,
					description: undefined,
				},
				{
					productSlug: PRODUCT_1GB_SPACE,
					featureSlugs: featureSlugs1GBSpace50,
					icon: spaceUpgradeIcon,
					quantity: 50,
					name: translate( '50 GB Storage' ),
					displayCost: displayCost1GBSpace50,
					prices: addOnPrices1GBSpace50,
					description: translate(
						'Make more space for high-quality photos, videos, and other media. '
					),
					featured: false,
					purchased: false,
					checkoutLink: checkoutLink( selectedSiteId ?? null, PRODUCT_1GB_SPACE, 50 ),
				},
				{
					productSlug: PRODUCT_1GB_SPACE,
					featureSlugs: featureSlugs1GBSpace100,
					icon: spaceUpgradeIcon,
					quantity: 100,
					name: translate( '100 GB Storage' ),
					displayCost: displayCost1GBSpace100,
					prices: addOnPrices1GBSpace100,
					description: translate(
						'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
					),
					featured: false,
					purchased: false,
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
			displayCostJetpackAIMonthly,
			displayCostUnlimitedThemes,
			featureSlugs1GBSpace100,
			featureSlugs1GBSpace50,
			featureSlugsCustomDesign,
			featureSlugsJetpackAIMonthly,
			featureSlugsUnlimitedThemes,
			selectedSiteId,
			translate,
		]
	);
};

interface Props {
	selectedSiteId?: number | null | undefined;
	enableStorageAddOns?: boolean;
}

const useAddOns = ( {
	selectedSiteId,
	enableStorageAddOns,
}: Props = {} ): ( AddOnMeta | null )[] => {
	const activeAddOns = useActiveAddOnsDefs( selectedSiteId );
	const productSlugs = activeAddOns.map( ( item ) => item.productSlug );
	const productsList = ProductsList.useProducts( productSlugs );
	const mediaStorage = Site.useSiteMediaStorage( { siteIdOrSlug: selectedSiteId } );
	const siteFeatures = Site.useSiteFeatures( { siteIdOrSlug: selectedSiteId } );
	const sitePurchases = Purchases.useSitePurchases( { siteId: selectedSiteId } );
	const spaceUpgradesPurchased = Purchases.useSitePurchasesByProductSlug( {
		siteId: selectedSiteId,
		productSlug: PRODUCT_1GB_SPACE,
	} );

	return useMemo(
		() =>
			activeAddOns
				.filter( ( addOn ) => {
					/**
					 * Remove the Jetpack AI add-on if the site already supports the feature.
					 * TODO: Potentially another candidate for migrating to `use-add-on-purchase-status`.
					 * The intention is to have a single source of truth. The add-on can be removed from display
					 * instead with an appropriate flag, but kept in list of add-ons.
					 */
					if (
						addOn.productSlug === PRODUCT_JETPACK_AI_MONTHLY &&
						siteFeatures.data?.active?.includes( WPCOM_FEATURES_AI_ASSISTANT )
					) {
						return false;
					}

					return true;
				} )
				.map( ( addOn ) => {
					const product = productsList.data?.[ addOn.productSlug ];
					const name = addOn.name ? addOn.name : product?.name || '';
					const description = addOn.description ?? ( product?.description || '' );

					/**
					 * If siteFeatures, sitePurchases, or productsList are still loading, show the add-on as loading.
					 * TODO: Potentially another candidate for migrating to `use-add-on-purchase-status`, and attach
					 * that to the add-on's meta if need to.
					 */
					if ( siteFeatures.isLoading || sitePurchases.isLoading || productsList.isLoading ) {
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
					 * If it's a storage add-on.
					 */
					if ( addOn.productSlug === PRODUCT_1GB_SPACE ) {
						// if storage add-ons are not enabled in the config or disabled via hook prop, remove them
						if (
							( 'boolean' === typeof enableStorageAddOns && ! enableStorageAddOns ) ||
							( ! isStorageAddonEnabled() && 'boolean' !== typeof enableStorageAddOns )
						) {
							return null;
						}

						/**
						 * If storage add-on is already purchased.
						 * TODO: Consider migrating this part to `use-add-on-purchase-status` and attach
						 * that to the add-on's meta if need to. The intention is to have a single source of truth.
						 */
						const isStorageAddOnPurchased = Object.values( spaceUpgradesPurchased ?? [] ).some(
							( purchase ) => purchase.purchaseRenewalQuantity === addOn.quantity
						);
						if ( isStorageAddOnPurchased ) {
							return {
								...addOn,
								name,
								description,
								purchased: true,
							};
						}

						/**
						 * If the current storage add-on option is greater than the available upgrade.
						 * TODO: This is also potentially a candidate for `use-add-on-purchase-status`.
						 */
						const currentMaxStorage = mediaStorage.data?.maxStorageBytes
							? mediaStorage.data.maxStorageBytes / Math.pow( 1024, 3 )
							: 0;
						const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;
						if ( ( addOn.quantity ?? 0 ) > availableStorageUpgrade ) {
							return {
								...addOn,
								name,
								description,
								exceedsSiteStorageLimits: true,
							};
						}
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
		[
			activeAddOns,
			enableStorageAddOns,
			mediaStorage.data?.maxStorageBytes,
			productsList.data,
			productsList.isLoading,
			siteFeatures.data?.active,
			siteFeatures.isLoading,
			sitePurchases.isLoading,
			spaceUpgradesPurchased,
		]
	);
};

export default useAddOns;
