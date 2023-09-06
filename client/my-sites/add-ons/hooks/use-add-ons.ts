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
import { TranslateResult, useTranslate } from 'i18n-calypso';
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
import { STORAGE_LIMIT } from '../constants';
import customDesignIcon from '../icons/custom-design';
import jetpackAIIcon from '../icons/jetpack-ai';
import jetpackStatsIcon from '../icons/jetpack-stats';
import spaceUpgradeIcon from '../icons/space-upgrade';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import isStorageAddonEnabled from '../is-storage-addon-enabled';
import useAddOnDisplayCost from './use-add-on-display-cost';
import useAddOnFeatureSlugs from './use-add-on-feature-slugs';

export interface AddOnMeta {
	productSlug: string;
	featureSlugs?: string[] | null;
	icon: JSX.Element;
	featured?: boolean; // irrelevant to "featureSlugs"
	name: string | null;
	quantity?: number;
	description: string | null;
	displayCost: TranslateResult | null;
	purchased?: boolean;
	isLoading?: boolean;
}

// some memoization. executes far too many times
const useAddOns = ( siteId?: number ): ( AddOnMeta | null )[] => {
	const translate = useTranslate();

	const addOnsActive = [
		{
			productSlug: PRODUCT_JETPACK_AI_MONTHLY,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_JETPACK_AI_MONTHLY ),
			icon: jetpackAIIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_JETPACK_AI_MONTHLY ),
			featured: true,
			description: translate(
				'Elevate your content with Jetpack AI, your AI assistant in the WordPress Editor. Save time writing with effortless content crafting, tone adjustment, title generation, grammar checks, translation, and more.'
			),
		},
		{
			productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_UNLIMITED_THEMES ),
			icon: unlimitedThemesIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_UNLIMITED_THEMES ),
			featured: true,
		},
		{
			productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_CUSTOM_DESIGN ),
			icon: customDesignIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_CUSTOM_DESIGN ),
			featured: false,
		},
		{
			productSlug: PRODUCT_1GB_SPACE,
			icon: spaceUpgradeIcon,
			quantity: 50,
			name: translate( '50 GB Storage' ),
			displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 50 ),
			description: translate(
				'Make more space for high-quality photos, videos, and other media. '
			),
			featured: false,
			purchased: false,
		},
		{
			productSlug: PRODUCT_1GB_SPACE,
			icon: spaceUpgradeIcon,
			quantity: 100,
			name: translate( '100 GB Storage' ),
			displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 100 ),
			description: translate(
				'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
			),
			featured: false,
			purchased: false,
		},
		{
			productSlug: PRODUCT_JETPACK_STATS_PWYW_YEARLY,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_JETPACK_STATS_PWYW_YEARLY ),
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
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_JETPACK_STATS_YEARLY ),
			icon: jetpackStatsIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_JETPACK_STATS_YEARLY ),
			featured: true,
			description: translate(
				'Upgrade Jetpack Stats to unlock priority support and all upcoming premium features.'
			),
		},
	];

	// if upgrade is bought - show as manage
	// if upgrade is not bought - only show it if available storage and if it's larger than previously bought upgrade
	const { data: mediaStorage } = useMediaStorageQuery( siteId );
	const { billingTransactions, isLoading } = usePastBillingTransactions();

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		// get the list of supported features
		const siteFeatures = getFeaturesBySiteId( state, siteId );
		const filter = getBillingTransactionFilters( state, 'past' );
		const filteredTransactions =
			billingTransactions && filterTransactions( billingTransactions, filter, siteId );

		const spaceUpgradesPurchased: number[] = [];

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

		// Determine which Stats Add-On to show based on the site's commercial classification.
		const isSiteMarkedCommercial = getSiteOption( state, siteId, 'is_commercial' );

		return addOnsActive
			.filter( ( addOn ) => {
				// if a user already has purchased a storage upgrade
				// remove all upgrades smaller than the smallest purchased upgrade (we only allow purchasing upgrades in ascending order)
				if ( spaceUpgradesPurchased.length && addOn.productSlug === PRODUCT_1GB_SPACE ) {
					return ( addOn.quantity ?? 0 ) >= Math.min( ...spaceUpgradesPurchased );
				}

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
					isSiteMarkedCommercial !== true &&
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
			.map( ( addOn ) => {
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
					if ( isLoading || ! product ) {
						return {
							...addOn,
							name,
							description,
							isLoading,
						};
					}

					// if storage add on is already purchased
					if (
						spaceUpgradesPurchased.findIndex(
							( spaceUpgrade ) => spaceUpgrade === addOn.quantity
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

					// if the current storage add on option is greater than the available upgrade, remove it
					if ( ( addOn.quantity ?? 0 ) > availableStorageUpgrade ) {
						return null;
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
	} );
};

export default useAddOns;
