import config from '@automattic/calypso-config';
import {
	FEATURE_STATS_PAID,
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	WPCOM_FEATURES_AI_ASSISTANT,
} from '@automattic/calypso-products';
import { useAddOnCheckoutLink } from '@automattic/data-stores';
import { createSelector } from '@automattic/state-utils';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import useMediaStorageQuery from 'calypso/data/media-storage/use-media-storage-query';
import { filterTransactions } from 'calypso/me/purchases/billing-history/filter-transactions';
import { useSelector } from 'calypso/state';
import {
	getProductBySlug,
	getProductDescription,
	getProductName,
} from 'calypso/state/products-list/selectors';
import getBillingTransactionFilters from 'calypso/state/selectors/get-billing-transaction-filters';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import { usePastBillingTransactions } from 'calypso/state/sites/hooks/use-billing-history';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import { STORAGE_LIMIT } from '../constants';
import customDesignIcon from '../icons/custom-design';
import jetpackAIIcon from '../icons/jetpack-ai';
import jetpackStatsIcon from '../icons/jetpack-stats';
import spaceUpgradeIcon from '../icons/space-upgrade';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import isStorageAddonEnabled from '../is-storage-addon-enabled';
import useAddOnDisplayCost from './use-add-on-display-cost';
import useAddOnFeatureSlugs from './use-add-on-feature-slugs';
import useAddOnPrices from './use-add-on-prices';
import type { AddOnMeta, SiteDetails } from '@automattic/data-stores';

const useSpaceUpgradesPurchased = ( {
	isInSignup,
	siteId,
}: {
	isInSignup: boolean;
	siteId?: number;
} ) => {
	const { billingTransactions, isLoading } = usePastBillingTransactions( isInSignup );
	const filter = useSelector( ( state ) => getBillingTransactionFilters( state, 'past' ) );

	return useMemo( () => {
		const spaceUpgradesPurchased: number[] = [];

		if ( billingTransactions && ! isInSignup ) {
			const filteredTransactions = filterTransactions( billingTransactions, filter, siteId );
			if ( filteredTransactions?.length ) {
				for ( const transaction of filteredTransactions ) {
					transaction.items?.length &&
						spaceUpgradesPurchased.push(
							...transaction.items
								.filter( ( item ) => item.wpcom_product_slug === PRODUCT_1GB_SPACE )
								.map( ( item ) => Number( item.licensed_quantity ) )
						);
				}
			}
		}

		return { isLoading, spaceUpgradesPurchased };
	}, [ billingTransactions, filter, isInSignup, siteId, isLoading ] );
};

const useActiveAddOnsDefs = ( selectedSite: SiteDetails | null ) => {
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
	const featureSlugsJetpackStatsYearly = useAddOnFeatureSlugs( PRODUCT_JETPACK_STATS_YEARLY );
	const featureSlugsJetpackStatsPWYWYearly = useAddOnFeatureSlugs(
		PRODUCT_JETPACK_STATS_PWYW_YEARLY
	);

	/*
	 * TODO: `useAddOnDisplayCost` be refactored instead to return an index of `{ [ slug ]: "display cost" }`
	 */
	const displayCostJetpackAIMonthly = useAddOnDisplayCost( PRODUCT_JETPACK_AI_MONTHLY );
	const displayCostUnlimitedThemes = useAddOnDisplayCost( PRODUCT_WPCOM_UNLIMITED_THEMES );
	const displayCostCustomDesign = useAddOnDisplayCost( PRODUCT_WPCOM_CUSTOM_DESIGN );
	const displayCost1GBSpace50 = useAddOnDisplayCost( PRODUCT_1GB_SPACE, 50 );
	const displayCost1GBSpace100 = useAddOnDisplayCost( PRODUCT_1GB_SPACE, 100 );
	const displayCostJetpackStatsYearly = useAddOnDisplayCost( PRODUCT_JETPACK_STATS_YEARLY );

	/*
	 * TODO: `useAddOnPrices` be refactored instead to return an index of `{ [ slug ]: AddOnPrice }`
	 */
	const addOnPrices1GBSpace50 = useAddOnPrices( PRODUCT_1GB_SPACE, 50 );
	const addOnPrices1GBSpace100 = useAddOnPrices( PRODUCT_1GB_SPACE, 100 );

	return useMemo(
		() => [
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
			},
			{
				productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
				featureSlugs: featureSlugsUnlimitedThemes,
				icon: unlimitedThemesIcon,
				overrides: null,
				displayCost: displayCostUnlimitedThemes,
				featured: true,
			},
			{
				productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
				featureSlugs: featureSlugsCustomDesign,
				icon: customDesignIcon,
				overrides: null,
				displayCost: displayCostCustomDesign,
				featured: false,
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
				checkoutLink: checkoutLink( selectedSite?.slug ?? null, PRODUCT_1GB_SPACE, 50 ),
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
				checkoutLink: checkoutLink( selectedSite?.slug ?? null, PRODUCT_1GB_SPACE, 100 ),
			},
			{
				productSlug: PRODUCT_JETPACK_STATS_PWYW_YEARLY,
				featureSlugs: featureSlugsJetpackStatsPWYWYearly,
				icon: jetpackStatsIcon,
				overrides: null,
				displayCost: translate( 'Varies', {
					comment:
						'Used to describe price of Jetpack Stats, which can be either a pay-what-you-want product or fixed price product. In the future, it can also be a metered product.',
				} ),
				featured: true,
				description: translate(
					'Upgrade Jetpack Stats to unlock priority support and all upcoming premium features.'
				),
			},
			{
				productSlug: PRODUCT_JETPACK_STATS_YEARLY,
				featureSlugs: featureSlugsJetpackStatsYearly,
				icon: jetpackStatsIcon,
				overrides: null,
				displayCost: displayCostJetpackStatsYearly,
				featured: true,
				description: translate(
					'Upgrade Jetpack Stats to unlock priority support and all upcoming premium features.'
				),
			},
		],
		[
			addOnPrices1GBSpace100,
			addOnPrices1GBSpace50,
			displayCost1GBSpace100,
			displayCost1GBSpace50,
			displayCostCustomDesign,
			displayCostJetpackAIMonthly,
			displayCostJetpackStatsYearly,
			displayCostUnlimitedThemes,
			featureSlugs1GBSpace100,
			featureSlugs1GBSpace50,
			featureSlugsCustomDesign,
			featureSlugsJetpackAIMonthly,
			featureSlugsJetpackStatsPWYWYearly,
			featureSlugsJetpackStatsYearly,
			featureSlugsUnlimitedThemes,
			translate,
		]
	);
};

const getAddOnsTransformed = createSelector(
	(
		state: AppState,
		activeAddOns,
		spaceUpgradesPurchased,
		siteId,
		isLoadingBillingTransactions,
		mediaStorage
	) => {
		const siteFeatures = getFeaturesBySiteId( state, siteId );
		const isSiteMarkedCommercial = getSiteOption( state, siteId, 'is_commercial' );

		return activeAddOns
			.filter( ( addOn: any ) => {
				// remove the Jetpack AI add-on if the site already supports the feature
				if (
					addOn.productSlug === PRODUCT_JETPACK_AI_MONTHLY &&
					siteFeatures?.active?.includes( WPCOM_FEATURES_AI_ASSISTANT )
				) {
					return false;
				}

				// TODO: Remove this check once paid WPCOM stats is live.
				// gate the Jetpack Stats add-on on a feature flag
				if (
					[ PRODUCT_JETPACK_STATS_PWYW_YEARLY, PRODUCT_JETPACK_STATS_YEARLY ].includes(
						addOn.productSlug
					) &&
					! config.isEnabled( 'stats/paid-wpcom-stats' )
				) {
					return false;
				}

				// Hide Stats Personal add-on if the site is marked as commercial.
				if (
					isSiteMarkedCommercial === true &&
					PRODUCT_JETPACK_STATS_PWYW_YEARLY === addOn.productSlug
				) {
					return false;
				}

				// Hide Stats Commercial add-on if the site is not marked as commercial.
				if (
					isSiteMarkedCommercial === false &&
					PRODUCT_JETPACK_STATS_YEARLY === addOn.productSlug
				) {
					return false;
				}

				// TODO: Show the Stats Commercial add-on for a commercial site that has purchased the Personal plan.

				// remove Jetpack Stats add-on if the site already has a paid stats feature through a paid plan.
				if (
					[ PRODUCT_JETPACK_STATS_PWYW_YEARLY, PRODUCT_JETPACK_STATS_YEARLY ].includes(
						addOn.productSlug
					) &&
					siteFeatures?.active?.includes( FEATURE_STATS_PAID )
				) {
					return false;
				}

				return true;
			} )
			.map( ( addOn: any ) => {
				const product = getProductBySlug( state, addOn.productSlug );
				const name = addOn.name ? addOn.name : getProductName( state, addOn.productSlug );
				const description = addOn.description ?? getProductDescription( state, addOn.productSlug );

				// if it's a storage add on
				if ( addOn.productSlug === PRODUCT_1GB_SPACE ) {
					// if storage add ons are not enabled in the config, remove them
					if ( ! isStorageAddonEnabled() ) {
						return null;
					}

					// if storage add on hasn't loaded yet
					if ( isLoadingBillingTransactions || ! product ) {
						return {
							...addOn,
							name,
							description,
							isLoading: isLoadingBillingTransactions,
						};
					}

					// if storage add on is already purchased
					if (
						spaceUpgradesPurchased.findIndex(
							( spaceUpgrade: any ) => spaceUpgrade === addOn.quantity
						) >= 0 &&
						product
					) {
						return {
							...addOn,
							name,
							description,
							purchased: true,
						};
					}

					const currentMaxStorage = mediaStorage?.max_storage_bytes / Math.pow( 1024, 3 );
					const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;

					// if the current storage add on option is greater than the available upgrade
					if ( ( addOn.quantity ?? 0 ) > availableStorageUpgrade ) {
						return {
							...addOn,
							name,
							description,
							exceedsSiteStorageLimits: true,
						};
					}
				}

				if ( ! product ) {
					// will not render anything if product not fetched from API
					// probably need some sort of placeholder in the add-ons page instead
					return null;
				}

				return {
					...addOn,
					name,
					description,
				};
			} );
	},
	(
		state,
		activeAddOns,
		spaceUpgradesPurchased,
		siteId,
		isLoadingBillingTransactions,
		mediaStorage
	) => [
		getFeaturesBySiteId( state, siteId ),
		getSiteOption( state, siteId, 'is_commercial' ),
		state.productsList,
		activeAddOns,
		spaceUpgradesPurchased,
		siteId,
		isLoadingBillingTransactions,
		mediaStorage,
	]
);

const useAddOns = ( siteId?: number, isInSignup = false ): ( AddOnMeta | null )[] => {
	// if upgrade is bought - show as manage
	// if upgrade is not bought - only show it if available storage and if it's larger than previously bought upgrade
	const { data: mediaStorage } = useMediaStorageQuery( siteId );
	const { isLoading, spaceUpgradesPurchased } = useSpaceUpgradesPurchased( { isInSignup, siteId } );
	const selectedSite = useSelector( getSelectedSite ) ?? null;
	const activeAddOns = useActiveAddOnsDefs( selectedSite );

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		return getAddOnsTransformed(
			state,
			activeAddOns,
			spaceUpgradesPurchased,
			siteId,
			isLoading,
			mediaStorage
		);
	} );
};

export default useAddOns;
