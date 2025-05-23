import { formatNumber } from '@automattic/number-formatters';
import { translate, useTranslate, getLocaleSlug } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import {
	PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_SCAN_BI_YEARLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH_BI_YEARLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_BI_YEARLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_JETPACK_SEARCH_FREE,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
	PRODUCT_JETPACK_BOOST_BI_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_JETPACK_AI_MONTHLY_100,
	PRODUCT_JETPACK_AI_MONTHLY_200,
	PRODUCT_JETPACK_AI_MONTHLY_500,
	PRODUCT_JETPACK_AI_MONTHLY_750,
	PRODUCT_JETPACK_AI_MONTHLY_1000,
	PRODUCT_JETPACK_AI_YEARLY,
	PRODUCT_JETPACK_AI_YEARLY_100,
	PRODUCT_JETPACK_AI_YEARLY_200,
	PRODUCT_JETPACK_AI_YEARLY_500,
	PRODUCT_JETPACK_AI_YEARLY_750,
	PRODUCT_JETPACK_AI_YEARLY_1000,
	PRODUCT_JETPACK_AI_BI_YEARLY,
	PRODUCT_JETPACK_AI_BI_YEARLY_100,
	PRODUCT_JETPACK_AI_BI_YEARLY_200,
	PRODUCT_JETPACK_AI_BI_YEARLY_500,
	PRODUCT_JETPACK_AI_BI_YEARLY_750,
	PRODUCT_JETPACK_AI_BI_YEARLY_1000,
	JETPACK_TAG_FOR_VIDEOGRAPHERS,
	JETPACK_TAG_FOR_ALL_SITES,
	JETPACK_TAG_FOR_BLOGGERS,
	JETPACK_TAG_FOR_BLOGS,
	JETPACK_TAG_FOR_EDUCATORS,
	JETPACK_TAG_FOR_MEMBERSHIP_SITES,
	JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
	JETPACK_TAG_FOR_ONLINE_FORUMS,
	JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY_10K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_100K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_250K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_500K,
	PRODUCT_JETPACK_STATS_BI_YEARLY_1M,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY_10K,
	PRODUCT_JETPACK_STATS_YEARLY_100K,
	PRODUCT_JETPACK_STATS_YEARLY_250K,
	PRODUCT_JETPACK_STATS_YEARLY_500K,
	PRODUCT_JETPACK_STATS_YEARLY_1M,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_MONTHLY_10K,
	PRODUCT_JETPACK_STATS_MONTHLY_100K,
	PRODUCT_JETPACK_STATS_MONTHLY_250K,
	PRODUCT_JETPACK_STATS_MONTHLY_500K,
	PRODUCT_JETPACK_STATS_MONTHLY_1M,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	PRODUCT_JETPACK_MONITOR_YEARLY,
	PRODUCT_JETPACK_MONITOR_MONTHLY,
	PRODUCT_WOOCOMMERCE_BOOKINGS,
	PRODUCT_WOOCOMMERCE_SUBSCRIPTIONS,
	PRODUCT_WOOCOMMERCE_PRODUCT_BUNDLES,
	PRODUCT_WOOCOMMERCE_PRODUCT_ADD_ONS,
	PRODUCT_WOOCOMMERCE_MINMAX_QUANTITIES,
	PRODUCT_WOOCOMMERCE_AUTOMATEWOO,
	PRODUCT_WOOCOMMERCE_ADVANCED_NOTIFICATIONS,
	PRODUCT_WOOCOMMERCE_ALL_PRODUCTS_WOO_SUBSCRIPTIONS,
	PRODUCT_WOOCOMMERCE_AUTOMATEWOO_BIRTHDAYS,
	PRODUCT_WOOCOMMERCE_AUTOMATEWOO_REFER_A_FRIEND,
	PRODUCT_WOOCOMMERCE_BACK_IN_STOCK_NOTIFICATIONS,
	PRODUCT_WOOCOMMERCE_BULK_STOCK_MANAGEMENT,
	PRODUCT_WOOCOMMERCE_CHECKOUT_FIELD_EDITOR,
	PRODUCT_WOOCOMMERCE_COMPOSITE_PRODUCTS,
	PRODUCT_WOOCOMMERCE_CONDITIONAL_SHIPPING_PAYMENTS,
	PRODUCT_WOOCOMMERCE_EU_VAT_NUMBER,
	PRODUCT_WOOCOMMERCE_FLAT_RATE_BOX_SHIPPING,
	PRODUCT_WOOCOMMERCE_GIFT_CARDS,
	PRODUCT_WOOCOMMERCE_GIFTING_WC_SUBSCRIPTIONS,
	PRODUCT_WOOCOMMERCE_PER_PRODUCT_SHIPPING,
	PRODUCT_WOOCOMMERCE_PRODUCT_CSV_IMPORT_SUITE,
	PRODUCT_WOOCOMMERCE_PRODUCT_RECOMMENDATIONS,
	PRODUCT_WOOCOMMERCE_PRODUCT_VENDORS,
	PRODUCT_WOOCOMMERCE_RETURNS_WARRANTY_REQUESTS,
	PRODUCT_WOOCOMMERCE_SUBSCRIPTION_DOWNLOADS,
	PRODUCT_WOOCOMMERCE_SHIPMENT_TRACKING,
	PRODUCT_WOOCOMMERCE_SHIPPING_MULTIPLE_ADDRESSES,
	PRODUCT_WOOCOMMERCE_STOREFRONT_EXTENSIONS_BUNDLE,
	PRODUCT_WOOCOMMERCE_TABLE_RATE_SHIPPING,
	PRODUCT_WOOCOMMERCE_ADDITIONAL_IMAGE_VARIATIONS,
	PRODUCT_WOOCOMMERCE_BOOKINGS_AVAILABILITY,
	PRODUCT_WOOCOMMERCE_BOX_OFFICE,
	PRODUCT_WOOCOMMERCE_BRANDS,
	PRODUCT_WOOCOMMERCE_COUPON_CAMPAIGNS,
	PRODUCT_WOOCOMMERCE_DEPOSITS,
	PRODUCT_WOOCOMMERCE_DISTANCE_RATE_SHIPPING,
	PRODUCT_WOOCOMMERCE_ONE_PAGE_CHECKOUT,
	PRODUCT_WOOCOMMERCE_ORDER_BARCODES,
	PRODUCT_WOOCOMMERCE_POINTS_AND_REWARDS,
	PRODUCT_WOOCOMMERCE_PRE_ORDERS,
	PRODUCT_WOOCOMMERCE_PURCHASE_ORDER_GATEWAY,
	PRODUCT_WOOCOMMERCE_SHIPPING,
	PRODUCT_WOOCOMMERCE_ACCOMMODATIONS_BOOKINGS,
	PRODUCT_WOOCOMMERCE_TAX,
	PRODUCT_WOOCOMMERCE_WOOPAYMENTS,
	PRODUCT_JETPACK_CREATOR_BI_YEARLY,
	PRODUCT_JETPACK_CREATOR_YEARLY,
	PRODUCT_JETPACK_CREATOR_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_MONTHLY,
	PRODUCT_WOOCOMMERCE_PRODUCT_FILTERS,
	PRODUCT_WOOCOMMERCE_CONSTELLATION,
	PRODUCT_WOOCOMMERCE_RENTAL_PRODUCTS,
	PRODUCT_WOOCOMMERCE_SMART_COUPONS,
	PRODUCT_WOOCOMMERCE_DYNAMIC_PRICING,
	PRODUCT_WOOCOMMERCE_VARIATION_SWATCHES_AND_PHOTOS,
} from './constants';
import type { FAQ, SelectorProductFeaturesItem } from './types';
import type { TranslateResult } from 'i18n-calypso';

export const getJetpackProductsShortNames = (): Record< string, React.ReactElement | string > => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: (
			<>
				VaultPress Backup <span>Daily</span>
			</>
		),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: (
			<>
				VaultPress Backup <span>Daily</span>
			</>
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: (
			<>
				VaultPress Backup <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
			</>
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: (
			<>
				VaultPress Backup <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
			</>
		),
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: 'VaultPress Backup',
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: 'Boost',
		[ PRODUCT_JETPACK_BOOST ]: 'Boost',
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: 'Boost',
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: (
			<>
				Scan <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
			</>
		),
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: (
			<>
				Scan <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
			</>
		),
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: 'Scan',
		[ PRODUCT_JETPACK_SCAN ]: 'Scan',
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: 'Scan',
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: 'Search',
		[ PRODUCT_JETPACK_SEARCH ]: 'Search',
		[ PRODUCT_JETPACK_SEARCH_FREE ]: 'Search',
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: 'Search',
		[ PRODUCT_WPCOM_SEARCH ]: 'Search',
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: 'Search',
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: (
			<>
				Akismet <span style={ { whiteSpace: 'nowrap' } }>Anti-spam</span>
			</>
		),
		[ PRODUCT_JETPACK_ANTI_SPAM ]: (
			<>
				Akismet <span style={ { whiteSpace: 'nowrap' } }>Anti-spam</span>
			</>
		),
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: (
			<>
				Akismet <span style={ { whiteSpace: 'nowrap' } }>Anti-spam</span>
			</>
		),
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: 'VideoPress',
		[ PRODUCT_JETPACK_VIDEOPRESS ]: 'VideoPress',
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: 'VideoPress',
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: 'Social',
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: 'Social',
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: 'Stats',
		[ PRODUCT_JETPACK_STATS_YEARLY ]: 'Stats',
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: 'Stats',
		[ PRODUCT_JETPACK_STATS_PWYW_YEARLY ]: 'Stats (Non-commercial license)',
		[ PRODUCT_JETPACK_STATS_FREE ]: 'Stats (Non-commercial license)',
		[ PRODUCT_JETPACK_AI_MONTHLY ]: 'AI',
		[ PRODUCT_JETPACK_AI_YEARLY ]: 'AI',
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: 'AI',
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: 'Creator',
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: 'Creator',
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: 'Creator',
	};
};

export const getJetpackProductsFullNames = (): Record< string, React.ReactElement | string > => {
	const jetpackFullNames = getJetpackProductsShortNames();

	jetpackFullNames[ PRODUCT_JETPACK_BACKUP_DAILY ] = (
		<>
			Jetpack VaultPress Backup <span>Daily</span>
		</>
	);

	jetpackFullNames[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ] = (
		<>
			Jetpack VaultPress Backup <span>Daily</span>
		</>
	);

	jetpackFullNames[ PRODUCT_JETPACK_BACKUP_REALTIME ] = (
		<>
			Jetpack VaultPress Backup <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
		</>
	);

	jetpackFullNames[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ] = (
		<>
			Jetpack VaultPress Backup <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
		</>
	);

	jetpackFullNames[ PRODUCT_JETPACK_SCAN_REALTIME ] = (
		<>
			Jetpack Scan <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
		</>
	);

	jetpackFullNames[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ] = (
		<>
			Jetpack Scan <span style={ { whiteSpace: 'nowrap' } }>Real-time</span>
		</>
	);

	Object.entries( jetpackFullNames ).forEach( ( [ key, shortName ] ) => {
		if ( typeof shortName === 'string' && ! shortName.includes( 'Akismet' ) ) {
			jetpackFullNames[ key ] = `Jetpack ${ shortName }`;
		}
	} );

	return jetpackFullNames;
};

export const getJetpackProductsDisplayNames = (
	type: 'short' | 'full' = 'short'
): Record< string, TranslateResult > => {
	const vaultPressBackupName =
		type === 'short'
			? getJetpackProductsShortNames()[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]
			: getJetpackProductsFullNames()[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ];
	const text10gb = translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
		comment:
			'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
		count: 10,
		args: { numberOfGigabytes: 10 },
	} );

	const text100gb = translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
		comment:
			'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
		count: 100,
		args: { numberOfGigabytes: 100 },
	} );

	const text1tb = translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
		comment:
			'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
		count: 1,
		args: { numberOfTerabytes: 1 },
	} );
	const text3tb = translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
		comment:
			'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
		count: 3,
		args: { numberOfTerabytes: 3 },
	} );
	const text5tb = translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
		comment:
			'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
		count: 5,
		args: { numberOfTerabytes: 5 },
	} );

	//Backup Add-on products
	const backupAddon10gb = translate( '%(pluginName)s Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text10gb, pluginName: vaultPressBackupName },
	} );
	const backupAddon100gb = translate( '%(pluginName)s Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text100gb, pluginName: vaultPressBackupName },
	} );
	const backupAddon1tb = translate( '%(pluginName)s Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text1tb, pluginName: vaultPressBackupName },
	} );
	const backupAddon3tb = translate( '%(pluginName)s Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text3tb, pluginName: vaultPressBackupName },
	} );
	const backupAddon5tb = translate( '%(pluginName)s Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text5tb, pluginName: vaultPressBackupName },
	} );

	const jetpackProductNames =
		type === 'short' ? getJetpackProductsShortNames() : getJetpackProductsFullNames();

	return {
		...jetpackProductNames,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: backupAddon10gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: backupAddon100gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: backupAddon1tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY ]: backupAddon3tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY ]: backupAddon5tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY ]: backupAddon10gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY ]: backupAddon100gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY ]: backupAddon1tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY ]: backupAddon3tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY ]: backupAddon5tb,
	};
};

export const getJetpackProductsTaglines = (): Record<
	string,
	{ default: TranslateResult; owned?: TranslateResult }
> => {
	const backupDailyTagline = translate( 'Best for sites with occasional updates' );
	const backupRealtimeTagline = translate( 'Best for sites with frequent updates' );
	const backupOwnedTagline = translate( 'Your site is actively being backed up' );
	const boostTagLine = translate( "Improve your site's performance" );
	const boostOwnedTagLine = translate( 'Your site is optimized with Boost' );
	// TODO: may need copy update
	const aiAssistantTagLine = translate(
		'Experience the ease of crafting content with intuitive and powerful AI.'
	);
	const aiAssistantOwnedTagLine = translate(
		'Your site is equipped with our intuitive and powerful AI.'
	);
	const creatorTagLine = translate(
		'Craft stunning content, boost your subscriber base, and monetize your online presence.'
	);
	const creatorOwnedTagLine = translate(
		'You have tools to create, grow, and monetize your audience.'
	);
	const searchTagline = translate( 'Recommended for sites with lots of products or content' );
	const statsTagline = translate(
		'With Jetpack Stats, you don’t need to be a data scientist to see how your site is performing.'
	);
	const scanTagline = translate( 'Protect your site' );
	const scanOwnedTagline = translate( 'Your site is actively being scanned for malicious threats' );
	const antiSpamTagline = translate( 'Block spam automatically' );
	const videoPressTagLine = translate( 'High-quality, ad-free video for WordPress' );
	const socialTagLine = translate(
		'Easily share your website content on your social media channels'
	);
	//TODO: fill in the actua value.
	const socialAdvancedTagLine = translate(
		'Easily share your website content on your social media channels'
	);
	const backupAddonTagLine = translate(
		'Additional storage for your Jetpack VaultPress Backup plan.'
	);
	const backupAddonOwnedTagLine = translate(
		'Your site has additional storage for Jetpack VaultPress Backup.'
	);
	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: {
			default: aiAssistantTagLine,
			owned: aiAssistantOwnedTagLine,
		},
		[ PRODUCT_JETPACK_AI_YEARLY ]: {
			default: aiAssistantTagLine,
			owned: aiAssistantOwnedTagLine,
		},
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: {
			default: aiAssistantTagLine,
			owned: aiAssistantOwnedTagLine,
		},
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: {
			default: creatorTagLine,
			owned: creatorOwnedTagLine,
		},
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: {
			default: creatorTagLine,
			owned: creatorOwnedTagLine,
		},
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: {
			default: creatorTagLine,
			owned: creatorOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
			default: backupDailyTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: {
			default: backupDailyTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		// TODO: get taglines specifically for the new Jetpack Backup products
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: {
			default: boostTagLine,
			owned: boostOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BOOST ]: {
			default: boostTagLine,
			owned: boostOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: {
			default: boostTagLine,
			owned: boostOwnedTagLine,
		},
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: { default: searchTagline },
		[ PRODUCT_JETPACK_SEARCH ]: { default: searchTagline },
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: { default: searchTagline },
		[ PRODUCT_JETPACK_SEARCH_FREE ]: { default: searchTagline },
		[ PRODUCT_WPCOM_SEARCH ]: { default: searchTagline },
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: { default: searchTagline },
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: { default: statsTagline },
		[ PRODUCT_JETPACK_STATS_YEARLY ]: { default: statsTagline },
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: { default: statsTagline },
		[ PRODUCT_JETPACK_STATS_PWYW_YEARLY ]: { default: statsTagline },
		[ PRODUCT_JETPACK_STATS_FREE ]: { default: statsTagline },
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ PRODUCT_JETPACK_SCAN ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: { default: antiSpamTagline },
		[ PRODUCT_JETPACK_ANTI_SPAM ]: { default: antiSpamTagline },
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: { default: antiSpamTagline },
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: { default: videoPressTagLine },
		[ PRODUCT_JETPACK_VIDEOPRESS ]: { default: videoPressTagLine },
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: { default: videoPressTagLine },
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: { default: socialAdvancedTagLine },
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: { default: socialAdvancedTagLine },
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: { default: socialAdvancedTagLine },
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
	};
};

export const getJetpackProductDisclaimers = (
	features: SelectorProductFeaturesItem[],
	link: string
): Record< string, TranslateResult > => {
	const backupDisclaimerFeatureSlugs = [
		'jetpack-1-year-archive-activity-log',
		'jetpack-30-day-archive-activity-log',
	];

	const featureSlugs = features.map( ( feature ) => feature.slug );

	/* Checks if any slugs of featues on the current Product match a set of slugs provided to this function. This determines whether or not to show the disclaimer based on whether the features the disclaimer is for is present */
	const doesProductHaveCompatibleSlug = ( slugsToCheckFor: string[] ) => {
		return slugsToCheckFor.some( ( slug ) => featureSlugs.includes( slug ) );
	};

	const getLink = () => {
		if ( link[ 0 ] === '#' ) {
			return <a href={ link }></a>;
		}

		return <a href={ link } target="_blank" rel="noreferrer"></a>;
	};

	const backupDisclaimer = doesProductHaveCompatibleSlug( backupDisclaimerFeatureSlugs ) ? (
		translate( 'Subject to your usage and storage limit. {{link}}Learn more{{/link}}.', {
			components: {
				link: getLink(),
			},
		} )
	) : (
		<></>
	);

	const aiAssistantDisclaimer = translate(
		'Limits apply for high request capacity. {{link}}Learn more about it here.{{/link}}',
		{
			components: {
				link: getLink(),
			},
		}
	);

	const monitorDisclaimer = translate( 'Limit of 20 SMS per site, each month.' );

	return {
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: backupDisclaimer,
		[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: backupDisclaimer,
		[ PLAN_JETPACK_COMPLETE ]: backupDisclaimer,
		[ PLAN_JETPACK_COMPLETE_MONTHLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_MONITOR_YEARLY ]: monitorDisclaimer,
		[ PRODUCT_JETPACK_MONITOR_MONTHLY ]: monitorDisclaimer,
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantDisclaimer,
		[ PRODUCT_JETPACK_AI_YEARLY ]: aiAssistantDisclaimer,
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: aiAssistantDisclaimer,
	};
};

export const getJetpackProductsDescriptions = (): Record< string, TranslateResult > => {
	const backupDailyDescription = translate(
		'Never lose a word, image, page, or time worrying about your site with automated backups & one-click restores.'
	);
	const backupRealtimeDescription = translate(
		'Real-time backups save every change and one-click restores get you back online quickly.'
	);
	const backupDescription = translate(
		'Save every change with real-time backups and get back online quickly with one-click restores.'
	);
	// TODO: may need copy update
	const aiAssistantDescription = translate(
		'Experience the ease of crafting content with intuitive and powerful AI.'
	);
	const creatorDescription = translate(
		'Craft stunning content, boost your subscriber base, and monetize your online presence.'
	);
	const boostDescription = translate(
		"One-click optimizations that supercharge your WordPress site's performance and improve web vitals scores for better SEO."
	);
	const searchDescription = translate(
		'Help your site visitors find answers instantly so they keep reading and buying. Great for sites with a lot of content.'
	);

	const scanDescription = translate(
		'Automatic scanning and one-click fixes keep your site one step ahead of security threats and malware.'
	);

	const videoPressDescription = translate(
		'High-quality, ad-free video built specifically for WordPress.'
	);

	const antiSpamDescription = translate(
		'Save time and get better responses by automatically blocking spam from your comments and forms.'
	);

	const socialDescription = translate(
		'Easily share your website content on your social media channels from one place.'
	);

	//TODO: fill in the right value.
	const socialAdvancedDescription = translate(
		'Easily share your website content on your social media channels from one place.'
	);

	const statsCommercialDescription = translate( 'The most advanced stats Jetpack has to offer.' );

	const monitorDescription = translate(
		'Upgrade Monitor with swift 1-minute monitoring alert intervals, SMS notifications, and multiple email recipients.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantDescription,
		[ PRODUCT_JETPACK_AI_YEARLY ]: aiAssistantDescription,
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: aiAssistantDescription,
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: creatorDescription,
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: creatorDescription,
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: creatorDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtimeDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtimeDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: boostDescription,
		[ PRODUCT_JETPACK_BOOST ]: boostDescription,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostDescription,
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: searchDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchDescription,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: videoPressDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: antiSpamDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: socialDescription,
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: statsCommercialDescription,
		[ PRODUCT_JETPACK_STATS_YEARLY ]: statsCommercialDescription,
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: statsCommercialDescription,
		[ PRODUCT_JETPACK_MONITOR_YEARLY ]: monitorDescription,
		[ PRODUCT_JETPACK_MONITOR_MONTHLY ]: monitorDescription,
	};
};

export const getJetpackProductsShortDescriptions = (): Record< string, TranslateResult > => {
	const backupDailyShortDescription = translate(
		'Automated daily backups with one-click restores.'
	);
	const backupRealtimeShortDescription = translate(
		'Real-time cloud backups with one-click restores.'
	);
	const backupShortDescription = translate(
		'Real-time cloud backups with one-click restores. Starts with %(amount)s.',
		{
			args: { amount: '10GB' },
			comment: '%s is a storage amount like 1TB or 10GB',
		}
	);
	const aiAssistantShortDescription = translate(
		'Experience the ease of crafting content with intuitive and powerful AI.'
	);
	const creatorShortDescription = translate( 'Create, grow, and monetize your audience.' );
	const boostShortDescription = translate(
		'Speed up your site and improve SEO - no developer required.'
	);
	const searchShortDescription = translate( 'Help your site visitors find answers instantly.' );
	const scanShortDescription = translate( '24/7 protection: WAF and automatic malware scanning.' );
	const videoPressShortDescription = translate(
		'High-quality, ad-free video built specifically for WordPress.'
	);
	const antiSpamShortDescription = translate(
		'Automatically clear spam from your comments and forms.'
	);
	const socialShortDescription = translate( 'Write once, post everywhere.' );
	//TODO: Fill in the right value.
	const socialAdvancedShortDescription = translate( 'Write once, post everywhere.' );

	const statsCommercialShortDescription = translate(
		'The most advanced stats Jetpack has to offer.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantShortDescription,
		[ PRODUCT_JETPACK_AI_YEARLY ]: aiAssistantShortDescription,
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: aiAssistantShortDescription,
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: creatorShortDescription,
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: creatorShortDescription,
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: creatorShortDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyShortDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyShortDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtimeShortDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtimeShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: boostShortDescription,
		[ PRODUCT_JETPACK_BOOST ]: boostShortDescription,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostShortDescription,
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: searchShortDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchShortDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchShortDescription,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanShortDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: videoPressShortDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressShortDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressShortDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: antiSpamShortDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamShortDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: socialShortDescription,
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: statsCommercialShortDescription,
		[ PRODUCT_JETPACK_STATS_YEARLY ]: statsCommercialShortDescription,
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: statsCommercialShortDescription,
	};
};

export const getJetpackProductsFeaturedDescription = (): Record< string, TranslateResult > => {
	const backupDailyFeaturedText = translate(
		'Never lose a word, image, page, or time worrying about your site with automated daily backups & one-click restores.'
	);
	const backupFeaturedText = translate(
		'Protect your site or store. Save every change with real-time cloud backups, and restore in one click.'
	);
	const videoPressFeaturedText = translate(
		'Own your content. High-quality, ad-free video built specifically for WordPress.'
	);
	const creatorFeaturedText = translate(
		'Craft stunning content, boost your subscriber base, and monetize your online presence.'
	);
	const antiSpamFeaturedText = translate(
		'Stop spam in comments and forms. Save time through automation and get rid of annoying CAPTCHAs.'
	);
	const scanFeaturedText = translate(
		'Stay ahead of security threats. Automatic scanning and one-click fixes give you and your customers peace of mind.'
	);
	const searchFeaturedText = translate(
		'Instant search helps your visitors actually find what they need and improves conversion.'
	);
	// TODO: may need alternate copy here
	const aiAssistantFeaturedText = translate(
		'Utilizing the potential of artificial intelligence, Jetpack AI brings a supportive layer to your content creation process.'
	);
	const boostFeaturedText = translate(
		'Instant speed and SEO boost. Get the same advantages as the top sites, no developer required.'
	);
	const socialFeaturedText = translate(
		'Write once, post everywhere. Easily share your content on social media from WordPress.'
	);
	//TODO: fill in the right value.
	const socialAdvancedFeaturedText = translate(
		'Write once, post everywhere. Easily share your content on social media from WordPress.'
	);

	const monitorFeaturedText = translate(
		'Upgrade Monitor with swift 1-minute monitoring alert intervals, SMS notifications, and multiple email recipients.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantFeaturedText,
		[ PRODUCT_JETPACK_AI_YEARLY ]: aiAssistantFeaturedText,
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: aiAssistantFeaturedText,
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: creatorFeaturedText,
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: creatorFeaturedText,
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: creatorFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: videoPressFeaturedText,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressFeaturedText,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressFeaturedText,
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: antiSpamFeaturedText,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamFeaturedText,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamFeaturedText,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: searchFeaturedText,
		[ PRODUCT_JETPACK_SEARCH ]: searchFeaturedText,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchFeaturedText,
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: boostFeaturedText,
		[ PRODUCT_JETPACK_BOOST ]: boostFeaturedText,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: socialFeaturedText,
		[ PRODUCT_JETPACK_MONITOR_YEARLY ]: monitorFeaturedText,
		[ PRODUCT_JETPACK_MONITOR_MONTHLY ]: monitorFeaturedText,
	};
};
export const getJetpackProductsLightboxDescription = (): Record< string, TranslateResult > => {
	const backupDailyLightboxDescription = translate(
		'Protect your site or store with automated daily cloud backups, and restore in one click from anywhere.'
	);
	const backupLightboxDescription = translate(
		'Protect your site or store. Save every change with real-time cloud backups, and restore in one click from anywhere.'
	);
	const videoPressLightboxDescription = translate(
		'Own your content: High-quality, ad-free video built specifically for WordPress.'
	);
	const antiSpamLightboxDescription = translate(
		'Automatically clear spam from your comments and forms.'
	);
	const creatorLightboxDescription = translate(
		'Craft stunning content, boost your subscriber base, and monetize your online presence.'
	);
	const scanLightboxDescription = translate(
		'Keep your site or store ahead of security threats with our WAF and automated malware scanning, including one-click fixes.'
	);
	const searchLightboxDescription = translate(
		'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content - right when they need it.'
	);
	const aiAssistantLightboxDescription = translate(
		'Utilizing the potential of artificial intelligence, Jetpack AI brings a supportive layer to your content creation process.'
	);
	const boostLightboxDescription = translate(
		'Jetpack Boost gives your site the same performance advantages as the world’s leading websites, no developer required.'
	);
	const socialLightboxDescription = translate(
		'Easily share your website content on your social media channels from one place.'
	);
	const socialAdvancedLightboxDescription = translate(
		'Easily share your website content on your social media channels from one place. Enjoy using the advanced plan for half price over the next year while we continue to develop the features.'
	);
	const statsLightboxDescription = translate( 'The most advanced stats Jetpack has to offer.' );
	const monitorLightboxDescription = translate(
		'Upgrade Monitor with swift 1-minute monitoring alert intervals, SMS notifications, and multiple email recipients.'
	);

	// WooCommerce Products
	const woocommerceBookingsLightboxDescription = translate(
		'Allow customers to book appointments, make reservations or rent equipment without leaving your site.'
	);
	const woocommerceSubscriptionsLightboxDescription = translate(
		'Let customers subscribe to your products or services and pay on a weekly, monthly, or annual basis.'
	);
	const woocommerceProductBundlesLightboxDescription = translate(
		'Offer personalized product bundles, bulk discount packages, and assembled products.'
	);
	const woocommerceProductAddOnsLightboxDescription = translate(
		'Offer add-ons like gift wrapping, special messages, or other special options for your products.'
	);
	const woocommerceMinMaxQuantitiesLightboxDescription = translate(
		'Minimum and maximum quantity rules for products, orders, and categories.'
	);
	const woocommerceAutomateWooLightboxDescription = translate(
		'Powerful marketing automation for WooCommerce. AutomateWoo has the tools you need to grow your store and make more money.'
	);
	const woocommerceAdvancedNotificationsLightboxDescription = translate(
		'Easily setup new order and stock email notifications for multiple recipients of your choosing.'
	);
	const woocommerceAllProductsWooSubscriptionsLightboxDescription = translate(
		'Add subscription plans to your existing products and start capturing residual revenue with All Products for WooCommerce Subscriptions.'
	);
	const woocommerceAutomatewooBirthdaysLightboxDescription = translate(
		'Delight customers and boost organic sales with a special WooCommerce birthday email (and coupon!) on their special day.'
	);
	const woocommerceAutomatewooReferAFriendLightboxDescription = translate(
		'Boost your organic sales by adding a customer referral program to your WooCommerce store.'
	);
	const woocommerceBackInStockNotificationsLightboxDescription = translate(
		'Notify customers when your out-of-stock products become available. Recover lost sales, build customer loyalty, and gain deeper insights into your inventory.'
	);
	const woocommerceBulkStockManagementLightboxDescription = translate(
		'Edit product and variation stock levels in bulk via this handy interface'
	);
	const woocommerceCheckoutFieldEditorLightboxDescription = translate(
		'Optimize your checkout process by adding, removing or editing fields to suit your needs.'
	);
	const woocommerceCompositeProductsLightboxDescription = translate(
		'The definitive product builder plugin for WooCommerce. Create and offer personalized product kits and custom product configurators.'
	);
	const woocommerceConditionalShippingPaymentsLightboxDescription = translate(
		'Use conditional logic to restrict the shipping methods, payment gateways and shipping countries or states available to customers at checkout.'
	);
	const woocommerceEuVatNumberLightboxDescription = translate(
		'Collect VAT numbers at checkout and remove the VAT charge for eligible EU businesses.'
	);
	const woocommerceFlatRateBoxShippingLightboxDescription = translate(
		'Pack items into boxes with pre-defined costs per destination'
	);
	const woocommerceGiftCardsLightboxDescription = translate(
		'Offer digital prepaid gift cards and e-gift certificates that customers can redeem at your WooCommerce store.'
	);
	const woocommerceGiftingWcSubscriptionsLightboxDescription = translate(
		"Offer customers a way to purchase subscriptions for others. A gift that keeps on giving for your customers and your store's revenue."
	);
	const woocommercePerProductShippingLightboxDescription = translate(
		'Define separate shipping costs per product which are combined at checkout to provide a total shipping cost.'
	);
	const woocommerceProductCsvImportSuiteLightboxDescription = translate(
		'Import, merge, and export products and variations to and from WooCommerce using a CSV file.'
	);
	const woocommerceProductRecommendationsLightboxDescription = translate(
		'Offer smarter upsells, cross-sells, and frequently bought together recommendations. Use analytics to measure their impact and optimize your strategies.'
	);
	const woocommerceProductVendorsLightboxDescription = translate(
		'Turn your store into a multi-vendor marketplace. Allow multiple vendors to sell via your site and in return take a commission on sales.'
	);
	const woocommerceReturnsWarrantyRequestsLightboxDescription = translate(
		'Manage the RMA process, add warranties to products, and let customers request and manage returns/exchanges from their account.'
	);
	const woocommerceSubscriptionDownloadsLightboxDescription = translate(
		'Offer additional downloads to your subscribers, via downloadable products listed in your store.'
	);
	const woocommerceShipmentTrackingLightboxDescription = translate(
		'Add shipment tracking information to your orders.'
	);
	const woocommerceShippingMultipleAddressesLightboxDescription = translate(
		'Allow your customers to ship individual items in a single order to multiple addresses.'
	);
	const woocommerceStorefrontExtensionsBundleLightboxDescription = translate(
		'All the tools you need to customize your WooCommerce store design. Storefront is our free, intuitive theme for WooCommerce - make it yours without touching code with the Storefront Extensions bundle.'
	);
	const woocommerceTableRateShippingLightboxDescription = translate(
		"The Table Rate shipping module extends WooCommerce's default shipping options giving you highly customisable shipping options."
	);
	const woocommerceAdditionalImageVariationsLightboxDescription = translate(
		'Unlimited images for your product variations.'
	);
	const woocommerceBookingsAvailabilityLightboxDescription = translate(
		'Sell more bookings by presenting a calendar or schedule of available slots in a page or post.'
	);
	const woocommerceBoxOfficeLightboxDescription = translate(
		'Sell tickets for your next event, concert, function, fundraiser or conference directly on your own site'
	);
	const woocommerceBrandsLightboxDescription = translate(
		'Create, assign and list brands for products, and allow customers to view by brand.'
	);
	const woocommerceCouponCampaignsLightboxDescription = translate(
		'Categorize coupons within coupon campaigns, making it easier to track the performance of a collection of coupons.'
	);
	const woocommerceDepositsLightboxDescription = translate(
		'Enable custom payment schedules with WooCommerce Deposits. Accept payments as deposits, layaway plans, or any desired payment structure.'
	);
	const woocommerceDistanceRateShippingLightboxDescription = translate(
		'WooCommerce Distance Rate shipping allows you to charge shipping rates based on the distance or total travel time to your customers as well as charge based on weight, total value or number of items in cart.'
	);
	const woocommerceOnePageCheckoutLightboxDescription = translate(
		'Create special pages where customers can choose products, checkout & pay all on the one page.'
	);
	const woocommerceOrderBarcodesLightboxDescription = translate(
		'Generates a unique barcode for each order on your site perfect for e-tickets, packing slips, reservations and a variety of other uses.'
	);
	const woocommercePointsAndRewardsLightboxDescription = translate(
		'Reward your customers for purchases and other actions with points which can be redeemed for discounts.'
	);
	const woocommercePreOrdersLightboxDescription = translate(
		'Allow customers to order products before they are available.'
	);
	const woocommercePurchaseOrderGatewayLightboxDescription = translate(
		'Seamlessly accept purchase orders as a payment method on your WooCommerce store.'
	);
	const woocommerceShippingLightboxDescription = translate(
		'Print USPS and DHL labels right from the WooCommerce desktop and save up to %(discountPercent)s instantly. WooCommerce Shipping is free and saves you time and money.',
		{
			args: {
				discountPercent: formatNumber( 0.9, {
					numberFormatOptions: { style: 'percent' },
				} ),
			},
		}
	);
	const woocommerceAccommodationsBookingsLightboxDescription = translate(
		'Book accommodation using WooCommerce and the WooCommerce Bookings extension.'
	);
	const woocommerceTaxLightboxDescription = translate(
		'Automatically calculate how much sales tax should be collected for WooCommerce orders — by city, country, or state — at checkout.'
	);
	const woocommerceWoopaymentsLightboxDescription = translate(
		"Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients' sites within Automattic for Agencies."
	);
	const woocommercProductFiltersLightboxDescription = translate(
		'This is a tool to create ajax product filters that make the process of finding products in your store simple and fast.'
	);
	const woocommerceConstellationLightboxDescription = translate(
		'A flexible, WooCommerce memberships platform to support publishers, purchasing clubs, online learning, associations, and more.'
	);
	const woocommerceRentalProductsLightboxDescription = translate(
		'Sell rental products in your store, manage rental orders and more.'
	);
	const woocommerceSmartCouponsLightboxDescription = translate(
		'Boost sales and customer loyalty. Create advanced discounts, sell gift cards, set BOGO deals, give store credits, and all types of rule based dynamic discounts with this all-in-one Smart Coupons plugin for WooCommerce.'
	);
	const woocommerceDynamicPricingLightboxDescription = translate(
		'Bulk discounts, role-based pricing and much more.'
	);
	const woocommerceVariationSwatchesAndPhotosLightboxDescription = translate(
		'Show color and image swatches instead of dropdowns for variable products.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantLightboxDescription,
		[ PRODUCT_JETPACK_AI_YEARLY ]: aiAssistantLightboxDescription,
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: aiAssistantLightboxDescription,
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: creatorLightboxDescription,
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: creatorLightboxDescription,
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: creatorLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: videoPressLightboxDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressLightboxDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressLightboxDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: antiSpamLightboxDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamLightboxDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: searchLightboxDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchLightboxDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchLightboxDescription,
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: boostLightboxDescription,
		[ PRODUCT_JETPACK_BOOST ]: boostLightboxDescription,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: statsLightboxDescription,
		[ PRODUCT_JETPACK_STATS_YEARLY ]: statsLightboxDescription,
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: statsLightboxDescription,
		[ PRODUCT_JETPACK_MONITOR_MONTHLY ]: monitorLightboxDescription,
		[ PRODUCT_JETPACK_MONITOR_YEARLY ]: monitorLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_BOOKINGS ]: woocommerceBookingsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_SUBSCRIPTIONS ]: woocommerceSubscriptionsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_BUNDLES ]: woocommerceProductBundlesLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_ADD_ONS ]: woocommerceProductAddOnsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_MINMAX_QUANTITIES ]: woocommerceMinMaxQuantitiesLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO ]: woocommerceAutomateWooLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_ADVANCED_NOTIFICATIONS ]:
			woocommerceAdvancedNotificationsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_ALL_PRODUCTS_WOO_SUBSCRIPTIONS ]:
			woocommerceAllProductsWooSubscriptionsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO_BIRTHDAYS ]:
			woocommerceAutomatewooBirthdaysLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO_REFER_A_FRIEND ]:
			woocommerceAutomatewooReferAFriendLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_BACK_IN_STOCK_NOTIFICATIONS ]:
			woocommerceBackInStockNotificationsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_BULK_STOCK_MANAGEMENT ]:
			woocommerceBulkStockManagementLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_CHECKOUT_FIELD_EDITOR ]:
			woocommerceCheckoutFieldEditorLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_COMPOSITE_PRODUCTS ]: woocommerceCompositeProductsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_CONDITIONAL_SHIPPING_PAYMENTS ]:
			woocommerceConditionalShippingPaymentsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_EU_VAT_NUMBER ]: woocommerceEuVatNumberLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_FLAT_RATE_BOX_SHIPPING ]:
			woocommerceFlatRateBoxShippingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_GIFT_CARDS ]: woocommerceGiftCardsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_GIFTING_WC_SUBSCRIPTIONS ]:
			woocommerceGiftingWcSubscriptionsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PER_PRODUCT_SHIPPING ]: woocommercePerProductShippingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_CSV_IMPORT_SUITE ]:
			woocommerceProductCsvImportSuiteLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_RECOMMENDATIONS ]:
			woocommerceProductRecommendationsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_VENDORS ]: woocommerceProductVendorsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_RETURNS_WARRANTY_REQUESTS ]:
			woocommerceReturnsWarrantyRequestsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_SUBSCRIPTION_DOWNLOADS ]:
			woocommerceSubscriptionDownloadsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_SHIPMENT_TRACKING ]: woocommerceShipmentTrackingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_SHIPPING_MULTIPLE_ADDRESSES ]:
			woocommerceShippingMultipleAddressesLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_STOREFRONT_EXTENSIONS_BUNDLE ]:
			woocommerceStorefrontExtensionsBundleLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_TABLE_RATE_SHIPPING ]: woocommerceTableRateShippingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_ADDITIONAL_IMAGE_VARIATIONS ]:
			woocommerceAdditionalImageVariationsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_BOOKINGS_AVAILABILITY ]:
			woocommerceBookingsAvailabilityLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_BOX_OFFICE ]: woocommerceBoxOfficeLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_BRANDS ]: woocommerceBrandsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_COUPON_CAMPAIGNS ]: woocommerceCouponCampaignsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_DEPOSITS ]: woocommerceDepositsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_DISTANCE_RATE_SHIPPING ]:
			woocommerceDistanceRateShippingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_ONE_PAGE_CHECKOUT ]: woocommerceOnePageCheckoutLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_ORDER_BARCODES ]: woocommerceOrderBarcodesLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_POINTS_AND_REWARDS ]: woocommercePointsAndRewardsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRE_ORDERS ]: woocommercePreOrdersLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PURCHASE_ORDER_GATEWAY ]:
			woocommercePurchaseOrderGatewayLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_SHIPPING ]: woocommerceShippingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_ACCOMMODATIONS_BOOKINGS ]:
			woocommerceAccommodationsBookingsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_TAX ]: woocommerceTaxLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_WOOPAYMENTS ]: woocommerceWoopaymentsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_FILTERS ]: woocommercProductFiltersLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_CONSTELLATION ]: woocommerceConstellationLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_RENTAL_PRODUCTS ]: woocommerceRentalProductsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_SMART_COUPONS ]: woocommerceSmartCouponsLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_DYNAMIC_PRICING ]: woocommerceDynamicPricingLightboxDescription,
		[ PRODUCT_WOOCOMMERCE_VARIATION_SWATCHES_AND_PHOTOS ]:
			woocommerceVariationSwatchesAndPhotosLightboxDescription,
	};
};

export const getJetpackProductsWhatIsIncluded = (): Record< string, Array< TranslateResult > > => {
	const realTimeBackup = translate( 'Real-time backups as you edit' );

	const orderBackups = translate( 'WooCommerce order and table backups' );
	const cloudBackups = translate( 'Redundant cloud backups on our global network' );
	const prioritySupport = translate( 'Priority support' );

	const backupIncludesInfoT0Storage = translate( '1GB of cloud storage' );
	const backupIncludesInfoT1Storage = translate( '10GB of cloud storage' );
	const backupIncludesInfoT2Storage = translate(
		'{{strong}}1TB (1,000GB){{/strong}} of cloud storage',
		{
			components: {
				strong: <strong />,
			},
		}
	);

	const backupIncludesInfoT1Log = translate( '30-day activity log archive *' );
	const backupIncludesInfoT2Log = translate( '{{strong}}1 year{{/strong}} activity log archive *', {
		components: {
			strong: <strong />,
		},
	} );

	const oneClickRestoreT1 = translate( 'Unlimited one-click restores from the last 30 days' );
	const oneClickRestoreT2 = translate(
		'Unlimited one-click restores from the last {{strong}}1 year{{/strong}}',
		{
			components: {
				strong: <strong />,
			},
		}
	);

	const otherIncludes = [ orderBackups, cloudBackups, prioritySupport ];
	const backupIncludesInfoT0 = [
		realTimeBackup,
		backupIncludesInfoT0Storage,
		backupIncludesInfoT1Log,
		oneClickRestoreT1,
		...otherIncludes,
	];
	const backupIncludesInfoT1 = [
		realTimeBackup,
		backupIncludesInfoT1Storage,
		backupIncludesInfoT1Log,
		oneClickRestoreT1,
		...otherIncludes,
	];
	const backupIncludesInfoT2 = [
		realTimeBackup,
		backupIncludesInfoT2Storage,
		backupIncludesInfoT2Log,
		oneClickRestoreT2,
		...otherIncludes,
	];

	const videoPressIncludesInfo = [
		translate( '1TB of cloud-hosted video' ),
		translate( 'Customizable video player' ),
		translate( 'Fast-motion video with 60 FPS and 4K resolution' ),
		translate( 'Global CDN' ),
		translate( 'Powerful and reliable hosting infrastructure' ),
		translate( 'Video and story blocks' ),
		translate( 'Unlimited logins for team members' ),
	];
	const creatorIncludesInfo = [
		translate( '40+ Jetpack blocks' ),
		translate( 'Display ads with WordAds' ),
		translate( 'Pay with PayPal' ),
		translate( 'Paid content gating' ),
		translate( 'Paywall access' ),
		translate( 'Newsletter' ),
		translate( 'Priority support' ),
		translate( '%(transactionFee)s transaction fees', {
			args: {
				transactionFee: formatNumber( 0.02, {
					numberFormatOptions: { style: 'percent' },
				} ),
			},
		} ),
	];
	const antiSpamIncludesInfo = [
		translate( 'Comment and form spam protection' ),
		translate( '10K API calls per month' ),
		translate( 'Akismet technology - 500B+ spam comments blocked to date' ),
		translate( 'Flexible API that works with any type of site' ),
	];
	const scanIncludesInfo = [
		translate( 'Website firewall (WAF)' ),
		translate( 'Automated daily scanning' ),
		translate( 'One-click fixes for most issues' ),
		translate( 'Instant email threat notifications' ),
		translate( 'Priority support' ),
	];
	const searchIncludesInfo = [
		translate( 'Instant search, filtering, and indexing' ),
		translate( 'Highly relevant search results' ),
		translate( 'Supports 38 languages' ),
		translate( 'Quick and accurate spelling correction' ),
	];

	const boostPremiumFeatureComponents = {
		div: <div className="premium-feature" />,
		strong: <span className="premium-feature-title" />,
		badge: <span style={ { display: 'none' } } className="premium-feature-badge" />,
	};

	const boostIncludesInfo = [
		translate(
			'{{div}}{{strong}}Automated critical CSS generation{{/strong}} {{badge}}PREMIUM{{/badge}}{{/div}}',
			{
				components: boostPremiumFeatureComponents,
			}
		),
		translate(
			'{{div}}{{strong}}Reduce image sizes with Image Guide{{/strong}} {{badge}}PREMIUM{{/badge}}{{/div}}',
			{
				components: boostPremiumFeatureComponents,
			}
		),
		translate(
			'{{div}}{{strong}}Historical site performance chart{{/strong}} {{badge}}PREMIUM{{/badge}}{{/div}}',
			{
				components: boostPremiumFeatureComponents,
			}
		),
		translate(
			'{{div}}{{strong}}Additional image quality control options{{/strong}} {{badge}}PREMIUM{{/badge}}{{/div}}',
			{
				components: boostPremiumFeatureComponents,
			}
		),
		translate( '{{div}}{{strong}}Priority support{{/strong}} {{badge}}PREMIUM{{/badge}}{{/div}}', {
			components: boostPremiumFeatureComponents,
		} ),
		translate( 'Faster server response with Page Cache' ),
		translate( 'Site performance scores' ),
		translate( 'One-click optimization' ),
		translate( 'Defer non-essential JavaScript' ),
		translate( 'Optimize CSS loading' ),
	];

	// Intl.ListFormat is not available in Mac OS Safari before Big Sur, so we
	// provide a fallback.
	const socialNetworksForSharing = [
		translate( 'Facebook' ),
		translate( 'Instagram' ),
		translate( 'Threads' ),
		translate( 'Bluesky' ),
		translate( 'LinkedIn' ),
		translate( 'Mastodon' ),
		translate( 'Tumblr' ),
		translate( 'Nextdoor' ),
	];
	let socialNetworksList = socialNetworksForSharing.join( ', ' );
	if ( 'ListFormat' in Intl ) {
		const listFormatter = new Intl.ListFormat( getLocaleSlug() || 'en' );
		socialNetworksList = listFormatter.format( socialNetworksForSharing );
	}

	const socialBasicIncludesInfo = [
		translate( 'Automatically share your posts and products on social media' ),
		translate( 'Post to multiple channels at once' ),
		translate( 'Manage all of your channels from a single hub' ),
		translate( 'Scheduled posts' ),
		translate( 'Share to %(socialNetworksList)s', {
			args: { socialNetworksList },
			comment: 'Comma separated list of social networks like "Facebook, Mastodon and Tumblr".',
		} ),
		translate( 'Recycle content' ),
	];
	const socialAdvancedIncludesInfo = [
		translate( 'Automatically share your posts and products on social media' ),
		translate( 'Post to multiple channels at once' ),
		translate( 'Manage all of your channels from a single hub' ),
		translate( 'Scheduled posts' ),
		translate( 'Share to %(socialNetworksList)s', {
			args: { socialNetworksList },
			comment: 'Comma separated list of social networks like "Facebook, Mastodon and Tumblr".',
		} ),
		translate( 'Upload custom images or videos with your posts' ),
		translate( 'Recycle content' ),
		translate( 'Automatically generate images for posts' ),
	];
	const socialIncludesInfo = socialAdvancedIncludesInfo;
	const statsCommercialIncludesInfo = [
		translate( 'Real-time data on visitors' ),
		translate( 'Traffic stats and trends for posts and pages' ),
		translate( 'Detailed statistics about links leading to your site' ),
		translate( 'GDPR compliance' ),
		translate( 'Access to upcoming advanced features' ),
		translate( 'Priority support' ),
		translate( 'Commercial use' ),
		translate( 'UTM tracking' ),
	];
	const aiAssistantIncludesInfo = [
		translate( 'Prompt-based content generation' ),
		translate( 'Text, table, and list generation' ),
		translate( 'Adaptive tone adjustment' ),
		translate( 'Superior spelling and grammar correction' ),
		translate( 'Title and summary generation' ),
	];

	// WooCommerce Extensions
	const woocommerceBookingsIncludesInfo = [
		translate(
			'Flexible online booking system - book classes, schedule appointments, or reserve items'
		),
		translate( 'Support for one-on-one appointments or multi-person events' ),
		translate( 'The ability to offer special pricing for groups, days, or individuals' ),
		translate( 'Support for all timezones' ),
		translate( 'The ability to require confirmations or offer free cancellations' ),
		translate( 'Reminder notifications' ),
		translate( 'Sync with Google Calendar' ),
		translate( 'Support for add-ons to customize the experience' ),
	];
	const woocommerceSubscriptionsIncludesInfo = [
		translate( 'Free Trials & Sign-Up Fees' ),
		translate( 'Variable Subscriptions' ),
		translate( 'Subscription Management' ),
		translate( 'Subscriber Account Management' ),
		translate( 'Synchronized Payments' ),
		translate( 'Upgrades/Downgrades' ),
		translate( 'Flexible Product Options' ),
		translate( 'Multiple Subscriptions' ),
		translate( 'Subscription Coupons' ),
		translate( 'Customer Emails' ),
	];
	const woocommerceProductBundlesIncludesInfo = [
		translate( 'Create bulk discount packages' ),
		translate( 'Offer personalized boxes' ),
		translate( 'Create assembled products' ),
		translate( 'Recommend add-ons and essentials' ),
		translate( 'Offer more engaging upsells' ),
	];
	const woocommerceProductAddOnsIncludesInfo = [
		translate( 'Image-based selections - customers can see what they’re getting before they buy.' ),
		translate(
			'Flat fees - charge customers a flat fee regardless of how many products they ordered.'
		),
		translate(
			'Percentage fees - charge a fee for the add-on based on a percent of the total price.'
		),
		translate(
			'Text input - Let your customers enter custom text to create a custom t-shirt, add a monogram or personalize a card.'
		),
		translate(
			'Dropdown - customers can choose between a few pre-defined options with a drop-down field for your add-on.'
		),
		translate( 'Checkboxes - make customization as easy and satisfying as checking a checkbox.' ),
		translate(
			'Custom price - let your customers name their price, perfect for tips, donations, and gratuity.'
		),
	];
	const woocommerceMinMaxQuantitiesIncludesInfo = [
		translate( 'The ability to set quantity rules for products, orders, and categories.' ),
	];
	const woocommerceAutomateWooIncludesInfo = [
		translate(
			'Follow-up Emails - Automatically email customers who buy specific products, ask for a review, or suggest other products they might like.'
		),
		translate(
			'Abandoned Cart - Remind customers who left items in their cart using emails at set intervals.'
		),
		translate(
			'Win Back Inactive Customers - Target inactive customers with email marketing campaigns. Include special offers and recommendations.'
		),
		translate(
			'SMS Notifications - Send SMS notifications to customers or admins for any of AutomateWoo’s wide range of triggers.'
		),
		translate(
			'Review Rewards - Encourage more product reviews by offering discounts. Limit the discount based on number of reviews posted and the rating given.'
		),
		translate(
			'Wishlist Marketing - Send timed wishlist reminder emails and notify when a wished product goes on sale. Integrates with WooCommerce Wishlists or YITH Wishlists.'
		),
		translate(
			'Card Expiry Notifications - Notify customers before a saved credit or debit card expires. This can reduce failed payments and churn when selling subscriptions.'
		),
		translate(
			'Personalized Coupons - Generate dynamically customized coupons for customers to raise purchase rates.'
		),
		translate(
			'Subscriptions Automation - Action WooCommerce Subscription events such as status changes, failed payments, and renewal reminders.'
		),
		translate(
			'Bookings Automations - Send emails on WooCommerce Bookings events such as booking confirmation or completion.'
		),
		translate(
			'Automatic VIP - Reward your best customers with VIP status based on different spending requirements.'
		),
	];
	const woocommerceAdvancedNotificationsIncludesInfo: any = null;
	const woocommerceAllProductsWooSubscriptionsIncludesInfo: any = null;
	const woocommerceAutomatewooBirthdaysIncludesInfo: any = null;
	const woocommerceAutomatewooReferAFriendIncludesInfo: any = null;
	const woocommerceBackInStockNotificationsIncludesInfo: any = null;
	const woocommerceBulkStockManagementIncludesInfo: any = null;
	const woocommerceCheckoutFieldEditorIncludesInfo: any = null;
	const woocommerceCompositeProductsIncludesInfo: any = null;
	const woocommerceConditionalShippingPaymentsIncludesInfo: any = null;
	const woocommerceEuVatNumberIncludesInfo: any = null;
	const woocommerceFlatRateBoxShippingIncludesInfo: any = null;
	const woocommerceGiftCardsIncludesInfo: any = null;
	const woocommerceGiftingWcSubscriptionsIncludesInfo: any = null;
	const woocommercePerProductShippingIncludesInfo: any = null;
	const woocommerceProductCsvImportSuiteIncludesInfo: any = null;
	const woocommerceProductRecommendationsIncludesInfo: any = null;
	const woocommerceProductVendorsIncludesInfo: any = null;
	const woocommerceReturnsWarrantyRequestsIncludesInfo: any = null;
	const woocommerceSubscriptionDownloadsIncludesInfo: any = null;
	const woocommerceShipmentTrackingIncludesInfo: any = null;
	const woocommerceShippingMultipleAddressesIncludesInfo: any = null;
	const woocommerceStorefrontExtensionsBundleIncludesInfo: any = null;
	const woocommerceTableRateShippingIncludesInfo: any = null;
	const woocommerceAdditionalImageVariationsIncludesInfo: any = null;
	const woocommerceBookingsAvailabilityIncludesInfo: any = null;
	const woocommerceBoxOfficeIncludesInfo: any = null;
	const woocommerceBrandsIncludesInfo: any = null;
	const woocommerceCouponCampaignsIncludesInfo: any = null;
	const woocommerceDepositsIncludesInfo: any = null;
	const woocommerceDistanceRateShippingIncludesInfo: any = null;
	const woocommerceOnePageCheckoutIncludesInfo: any = null;
	const woocommerceOrderBarcodesIncludesInfo: any = null;
	const woocommercePointsAndRewardsIncludesInfo: any = null;
	const woocommercePreOrdersIncludesInfo: any = null;
	const woocommercePurchaseOrderGatewayIncludesInfo: any = null;
	const woocommerceShippingIncludesInfo: any = null;
	const woocommerceAccommodationsBookingsIncludesInfo: any = null;
	const woocommerceTaxIncludesInfo: any = null;
	const woocommerceWoopaymentsIncludesInfo: any = null;
	const monitorIncludesInfo = [
		translate( '1-minute monitoring interval' ),
		translate( 'Multiple email recipients' ),
		translate( 'SMS notifications*' ),
	];

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: [
			translate( 'High request capacity *' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_MONTHLY_100 ]: [
			translate( '100 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_MONTHLY_200 ]: [
			translate( '200 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_MONTHLY_500 ]: [
			translate( '500 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_MONTHLY_750 ]: [
			translate( '750 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_MONTHLY_1000 ]: [
			translate( '1000 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_YEARLY ]: [
			translate( 'High request capacity *' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_YEARLY_100 ]: [
			translate( '100 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_YEARLY_200 ]: [
			translate( '200 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_YEARLY_500 ]: [
			translate( '500 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_YEARLY_750 ]: [
			translate( '750 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_YEARLY_1000 ]: [
			translate( '1000 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: [
			translate( 'High request capacity *' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_BI_YEARLY_100 ]: [
			translate( '100 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_BI_YEARLY_200 ]: [
			translate( '200 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_BI_YEARLY_500 ]: [
			translate( '500 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_BI_YEARLY_750 ]: [
			translate( '750 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_AI_BI_YEARLY_1000 ]: [
			translate( '1000 monthly requests (upgradeable)' ),
			...aiAssistantIncludesInfo,
		],
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupIncludesInfoT0,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupIncludesInfoT0,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupIncludesInfoT2,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupIncludesInfoT2,
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: videoPressIncludesInfo,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressIncludesInfo,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressIncludesInfo,
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: creatorIncludesInfo,
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: creatorIncludesInfo,
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: creatorIncludesInfo,
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: antiSpamIncludesInfo,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamIncludesInfo,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: searchIncludesInfo,
		[ PRODUCT_JETPACK_SEARCH ]: searchIncludesInfo,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchIncludesInfo,
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: boostIncludesInfo,
		[ PRODUCT_JETPACK_BOOST ]: boostIncludesInfo,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: socialBasicIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialBasicIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialBasicIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: socialIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: socialIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: socialIncludesInfo,
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: [
			translate( '10K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_BI_YEARLY_10K ]: [
			translate( '10K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_BI_YEARLY_100K ]: [
			translate( '100K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_BI_YEARLY_250K ]: [
			translate( '250K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_BI_YEARLY_500K ]: [
			translate( '500K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_BI_YEARLY_1M ]: [
			translate( '1M site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_YEARLY ]: [
			translate( '10K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_YEARLY_10K ]: [
			translate( '10K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_YEARLY_100K ]: [
			translate( '100K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_YEARLY_250K ]: [
			translate( '250K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_YEARLY_500K ]: [
			translate( '500K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_YEARLY_1M ]: [
			translate( '1M site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: [
			translate( '10K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_MONTHLY_10K ]: [
			translate( '10K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_MONTHLY_100K ]: [
			translate( '100K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_MONTHLY_250K ]: [
			translate( '250K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_MONTHLY_500K ]: [
			translate( '500K site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_STATS_MONTHLY_1M ]: [
			translate( '1M site views (upgradeable)' ),
			...statsCommercialIncludesInfo,
		],
		[ PRODUCT_JETPACK_MONITOR_YEARLY ]: monitorIncludesInfo,
		[ PRODUCT_JETPACK_MONITOR_MONTHLY ]: monitorIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_BOOKINGS ]: woocommerceBookingsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_SUBSCRIPTIONS ]: woocommerceSubscriptionsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_BUNDLES ]: woocommerceProductBundlesIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_ADD_ONS ]: woocommerceProductAddOnsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_MINMAX_QUANTITIES ]: woocommerceMinMaxQuantitiesIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO ]: woocommerceAutomateWooIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_ADVANCED_NOTIFICATIONS ]: woocommerceAdvancedNotificationsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_ALL_PRODUCTS_WOO_SUBSCRIPTIONS ]:
			woocommerceAllProductsWooSubscriptionsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO_BIRTHDAYS ]: woocommerceAutomatewooBirthdaysIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO_REFER_A_FRIEND ]:
			woocommerceAutomatewooReferAFriendIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_BACK_IN_STOCK_NOTIFICATIONS ]:
			woocommerceBackInStockNotificationsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_BULK_STOCK_MANAGEMENT ]: woocommerceBulkStockManagementIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_CHECKOUT_FIELD_EDITOR ]: woocommerceCheckoutFieldEditorIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_COMPOSITE_PRODUCTS ]: woocommerceCompositeProductsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_CONDITIONAL_SHIPPING_PAYMENTS ]:
			woocommerceConditionalShippingPaymentsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_EU_VAT_NUMBER ]: woocommerceEuVatNumberIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_FLAT_RATE_BOX_SHIPPING ]: woocommerceFlatRateBoxShippingIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_GIFT_CARDS ]: woocommerceGiftCardsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_GIFTING_WC_SUBSCRIPTIONS ]: woocommerceGiftingWcSubscriptionsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PER_PRODUCT_SHIPPING ]: woocommercePerProductShippingIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_CSV_IMPORT_SUITE ]: woocommerceProductCsvImportSuiteIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_RECOMMENDATIONS ]: woocommerceProductRecommendationsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_VENDORS ]: woocommerceProductVendorsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_RETURNS_WARRANTY_REQUESTS ]:
			woocommerceReturnsWarrantyRequestsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_SUBSCRIPTION_DOWNLOADS ]: woocommerceSubscriptionDownloadsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_SHIPMENT_TRACKING ]: woocommerceShipmentTrackingIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_SHIPPING_MULTIPLE_ADDRESSES ]:
			woocommerceShippingMultipleAddressesIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_STOREFRONT_EXTENSIONS_BUNDLE ]:
			woocommerceStorefrontExtensionsBundleIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_TABLE_RATE_SHIPPING ]: woocommerceTableRateShippingIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_ADDITIONAL_IMAGE_VARIATIONS ]:
			woocommerceAdditionalImageVariationsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_BOOKINGS_AVAILABILITY ]: woocommerceBookingsAvailabilityIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_BOX_OFFICE ]: woocommerceBoxOfficeIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_BRANDS ]: woocommerceBrandsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_COUPON_CAMPAIGNS ]: woocommerceCouponCampaignsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_DEPOSITS ]: woocommerceDepositsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_DISTANCE_RATE_SHIPPING ]: woocommerceDistanceRateShippingIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_ONE_PAGE_CHECKOUT ]: woocommerceOnePageCheckoutIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_ORDER_BARCODES ]: woocommerceOrderBarcodesIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_POINTS_AND_REWARDS ]: woocommercePointsAndRewardsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PRE_ORDERS ]: woocommercePreOrdersIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_PURCHASE_ORDER_GATEWAY ]: woocommercePurchaseOrderGatewayIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_SHIPPING ]: woocommerceShippingIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_ACCOMMODATIONS_BOOKINGS ]: woocommerceAccommodationsBookingsIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_TAX ]: woocommerceTaxIncludesInfo,
		[ PRODUCT_WOOCOMMERCE_WOOPAYMENTS ]: woocommerceWoopaymentsIncludesInfo,
	};
};

export const getJetpackProductsWhatIsIncludedComingSoon = (): Record<
	string,
	Array< TranslateResult >
> => {
	const socialAdvancedIncludesInfo = [ translate( 'Multi-image sharing' ) ];

	return {
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedIncludesInfo,
	};
};

export const getJetpackProductsBenefits = (): Record< string, Array< TranslateResult > > => {
	const getLink = ( href: string ) => (
		<a href={ href } target="_blank" rel="noopener noreferrer"></a>
	);

	const backupBenefits = [
		translate( 'Protect your revenue stream and content' ),
		translate( 'Restore your site in one click from desktop or mobile' ),
		translate( 'Restore or clone offline sites' ),
		translate( 'Fix your site without a developer' ),
		translate( 'Protect Woo order and customer data' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const scanBenefits = [
		translate( 'Protect your revenue stream and content' ),
		translate( 'Learn about issues before your customers are impacted' ),
		translate( 'Fix most issues in one click from desktop or mobile' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];
	const antiSpamBenefits = [
		translate( 'Set up in minutes without a developer' ),
		translate( 'Save time manually reviewing spam' ),
		translate( 'Increase engagement by removing CAPTCHAs' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];
	const videoPressBenefits = [
		translate( 'Increase engagement and get your message across' ),
		translate( 'Drag and drop videos through the WordPress editor' ),
		translate( 'Manage videos in the WordPress media library' ),
		translate( 'Remove distracting ads' ),
		translate( 'Customizable colors to fit your brand and site' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const searchBenefits = [
		translate( "Customizable to fit your site's design" ),
		translate( 'Increase conversion with accurate search results' ),
		translate( 'Tiered pricing - pay for only what you need' ),
		translate( 'No developer required' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const boostBenefits = [
		translate( 'Quickly test and improve your site speed' ),
		translate( "Improve your site's SEO" ),
		translate( 'Get faster FCP and LCP' ),
		translate( 'No developer required' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const socialBasicBenefits = [
		translate( 'Save time by sharing your posts automatically' ),
		translate( 'Unlock your growth potential by building a following on social media' ),
		translate( 'Easy-to-use interface' ),
		translate( 'No developer required' ),
		translate( 'Repurpose, reuse or republish already published content' ),
	];

	const socialAdvancedBenefits = [
		translate( 'Save time by sharing your posts automatically' ),
		translate( 'Unlock your growth potential by building a following on social media' ),
		translate( 'Easy-to-use interface' ),
		translate( 'No developer required' ),
		translate( 'Enhance social media engagement with personalized posts' ),
		translate( 'Upload & automatically share images and videos to social media' ),
		translate( 'Automatically create custom images, saving you hours of tedious work' ),
		translate( 'Repurpose, reuse or republish already published content' ),
	];

	const socialBenefits = socialAdvancedBenefits;

	const statsCommercialBenefits = [
		translate( 'Better understand your audience' ),
		translate( 'Discover your top performing posts & pages' ),
		translate( 'Get detailed insights on the referrers that bring traffic from your site' ),
		translate( 'See what countries your visitors are coming from' ),
		translate(
			'Find who is creating the most popular content on your team with our author metrics'
		),
		translate( 'View weekly and yearly trends with 7-day Highlights and Year in Review' ),
		translate( 'UTM tracking' ),
		translate( 'Traffic spike forgiveness' ),
		translate( 'Overage forgiveness' ),
		translate( 'Commercial use' ),
	];

	const aiAssistantBenefits = [
		translate( 'Harness AI power directly from your editor' ),
		translate( 'Unlock high-quality, tailored content at your command' ),
		translate( 'Maintain professional standards with ease' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const creatorBenefits = [
		translate( 'Quickly create content that stands out' ),
		translate( 'Grow your subscribers with simple subscribe forms' ),
		translate( 'Create content for paid subscribers' ),
		translate( 'Sell access to premium content' ),
		translate( 'Easily accept tips and donations' ),
	];

	// WooCommerce Extensions benefits
	const woocommerceBookingsBenefits = [
		translate(
			'Let your customers book reservations, appointments, or rentals independently - no phone calls are required.'
		),
		translate(
			'Offer discounts for groups or people booking multiple slots, show lower prices for early birds, higher prices on weekends, or special prices for kids.'
		),
		translate( 'Your customers see availability in their time zone' ),
		translate( 'Reduce no-shows with reminder notifications' ),
		translate( 'An intelligent booking system to avoid double-bookings' ),
		translate( 'Boost your bookings with a range of add-ons' ),
	];
	const woocommerceSubscriptionsBenefits = [
		translate( 'Multiple billing schedules available to suit your store’s needs' ),
		translate( 'Integration with over 25 payment gateways for automatic recurring payments' ),
		translate(
			'Supports manual renewal payments through any WooCommerce payment gateway, along with automatic email invoices and receipts'
		),
		translate( 'Supports automatic rebilling on failed subscription payments' ),
		translate( 'Give subscribers the ability to manage their own plan' ),
		translate( 'Built-in renewal notifications and automatic emails' ),
		translate(
			'Detailed reports allow you to keep track of recurring revenue, the number of active subscribers, and more'
		),
	];
	const woocommerceProductBundlesBenefits = [
		translate( 'Sell more by creating discounted bundles or personalized boxes' ),
		translate( 'Create product offerings made from multiple inventory-managed parts.' ),
		translate(
			'Boost your average order value by adding recommendations to popular products, and use discounts to maximize their impact.'
		),
	];
	const woocommerceProductAddOnsBenefits = [
		translate( 'You can offer special options to your customers.' ),
		translate(
			'Enable your customers to personalize products while they are shopping on your online store'
		),
	];
	const woocommerceMinMaxQuantitiesBenefits = [
		translate( 'Specify minimum and maximum quantity limits per product/variation or order.' ),
		translate(
			'Require specific products, or product categories, to be purchased in predefined quantity multiples.'
		),
		translate(
			'Prevent overstocking or stockouts, maintain optimal inventory levels, and reduce storage costs.'
		),
	];
	const woocommerceAutomateWooBenefits = [
		translate( 'Effortless setup and management right from your WordPress backend' ),
		translate( 'Send targeted, multi-step campaigns and offer customer incentives' ),
		translate( 'Measure the success of your campaigns' ),
		translate( 'Unlimited email sends' ),
		translate( 'AutomateWoo is %(extentablePercent)s extendable', {
			args: {
				extentablePercent: formatNumber( 1, {
					numberFormatOptions: { style: 'percent' },
				} ),
			},
			comment: '100% extendable',
		} ),
		translate( 'Multilingual support. AutomateWoo has support for the popular WPML plugin' ),
		translate( 'AutomateWoo integrates with your favorite plugins and services' ),
	];
	const woocommerceAdvancedNotificationsBenefits = [
		translate( 'Set up order and stock notifications for multiple recipients beyond admin' ),
		translate( 'Notify staff, suppliers, or drop shippers of sales and inventory changes' ),
		translate( 'Customize notification criteria and content' ),
		translate( 'Choose between plain text or HTML email formats' ),
		translate( 'Set up per-product notifications' ),
		translate( 'Include or exclude prices and order totals in notifications' ),
	];
	const woocommerceAllProductsWooSubscriptionsBenefits = [
		translate( 'Add subscription plans to existing Simple or Variable products' ),
		translate( 'Sell any product one-time or on a subscription' ),
		translate( 'Allow customers to add products to existing subscriptions' ),
		translate( 'Create personalized subscription boxes with Product Bundles integration' ),
		translate( 'Define global or custom subscription plans for individual products' ),
		translate( 'Limit subscription options to specific product categories' ),
	];
	const woocommerceAutomatewooBirthdaysBenefits = [
		translate( 'Send automated birthday emails and coupons to customers' ),
		translate( 'Increase brand loyalty and boost sales with personalized birthday messages' ),
		translate( 'Collect customer birthdays during checkout or on account pages' ),
		translate( 'Configure workflows to run before, on, or after customer birthdays' ),
		translate( 'Personalize email content with customer data and birthday-specific offers' ),
		translate( 'Supports GDPR compliance for customer data' ),
	];
	const woocommerceAutomatewooReferAFriendBenefits = [
		translate( 'Boost word-of-mouth sales with a customer referral program' ),
		translate( 'Run coupon-based or link-based referral campaigns' ),
		translate( 'Allow advocates to share referrals via email, Facebook, X, and WhatsApp' ),
		translate( 'Reward advocates with store credit for successful referrals' ),
		translate( 'Include post-purchase share widgets on order confirmation pages and emails' ),
		translate( 'Implement fraud prevention measures to protect the referral program' ),
		translate( 'Provide detailed reporting on referral program performance' ),
	];
	const woocommerceBackInStockNotificationsBenefits = [
		translate( 'Allow customers to subscribe for stock notifications' ),
		translate( 'Automatically notify customers when products are back in stock' ),
		translate( 'Works with Simple, Variable, Grouped, and Subscription products' ),
		translate( 'Manage all notification sign-ups from a central admin area' ),
		translate( 'Export subscriber data for use in email marketing platforms' ),
		translate( 'Process notifications in batches using Action Scheduler for scalability' ),
		translate( 'Set minimum quantity thresholds for sending restock notifications' ),
	];
	const woocommerceBulkStockManagementBenefits = [
		translate( 'Manage product stock levels from a single interface' ),
		translate( 'Filter products by type, stock management status, and stock status' ),
		translate( 'Order products by name, ID, SKU, or stock quantity' ),
		translate( 'Set stock quantities for multiple products at once' ),
		translate( 'Apply bulk actions like setting stock status or allowing backorders' ),
		translate( 'Generate printable stock reports for inventory management' ),
	];
	const woocommerceCheckoutFieldEditorBenefits = [
		translate( 'Customize checkout fields' ),
		translate( 'Add, edit, or remove fields on the checkout page' ),
		translate( 'Rearrange the order of checkout fields' ),
		translate( 'Set custom field validations' ),
	];
	const woocommerceCompositeProductsBenefits = [
		translate( 'Create complex product kits or bundles' ),
		translate( 'Allow customers to configure custom product combinations' ),
		translate( 'Set component options and quantity limits' ),
		translate( 'Apply conditional logic to component visibility' ),
	];
	const woocommerceConditionalShippingPaymentsBenefits = [
		translate( 'Set rules for shipping/payment methods based on cart contents' ),
		translate( 'Customize available options based on customer location or purchase' ),
		translate( 'Create complex rules combining multiple conditions' ),
		translate(
			'Hide or show shipping/payment methods based on product categories, tags, or attributes'
		),
	];
	const woocommerceEuVatNumberBenefits = [
		translate( 'Collect and validate EU VAT numbers' ),
		translate( 'Apply correct VAT rates for B2B transactions' ),
		translate( 'Ensure compliance with EU tax regulations' ),
		translate( 'Automatically validate VAT numbers in real-time' ),
		translate( 'Generate VAT reports for easy tax filing' ),
	];
	const woocommerceFlatRateBoxShippingBenefits = [
		translate( 'Offer flat rate shipping based on box sizes' ),
		translate( 'Optimize shipping costs for differently sized products' ),
		translate( 'Define multiple box sizes and their respective shipping rates' ),
		translate( 'Automatically select the most cost-effective box for each order' ),
	];
	const woocommerceGiftCardsBenefits = [
		translate( 'Sell and redeem gift cards' ),
		translate( 'Offer store credit as a product' ),
		translate( 'Allow customers to purchase and send digital gift cards' ),
		translate( 'Set expiration dates and custom designs for gift cards' ),
		translate( 'Track gift card usage and balances' ),
	];
	const woocommerceGiftingWcSubscriptionsBenefits = [
		translate( 'Allow customers to gift subscriptions' ),
		translate( 'Manage gifted subscriptions separately from personal ones' ),
		translate( 'Set up gift subscription products' ),
		translate( 'Allow gift recipients to manage their gifted subscriptions' ),
	];
	const woocommercePerProductShippingBenefits = [
		translate( 'Set unique shipping costs for individual products' ),
		translate( 'Customize shipping rates based on product characteristics' ),
		translate( 'Define shipping costs at the product level' ),
		translate( 'Override global shipping settings for specific products' ),
	];
	const woocommerceProductCsvImportSuiteBenefits = [
		translate( 'Bulk import/export products via CSV' ),
		translate( 'Easily manage large product catalogs' ),
		translate( 'Map CSV columns to product fields' ),
		translate( 'Schedule automated imports/exports' ),
		translate( 'Handle complex product types including variable products' ),
	];
	const woocommerceProductRecommendationsBenefits = [
		translate( 'Display personalized product recommendations' ),
		translate( 'Increase average order value with targeted suggestions' ),
		translate( 'Use AI-powered algorithms for smart recommendations' ),
		translate( 'Place recommendation widgets on various store pages' ),
	];
	const woocommerceProductVendorsBenefits = [
		translate( 'Create a multi-vendor marketplace' ),
		translate( 'Allow multiple sellers on a single WooCommerce store' ),
		translate( 'Manage vendor accounts and commissions' ),
		translate( 'Set up individual vendor storefronts' ),
		translate( 'Automate commission calculations and payouts' ),
	];
	const woocommerceReturnsWarrantyRequestsBenefits = [
		translate( 'Streamline returns and warranty claim process' ),
		translate( 'Manage customer service requests efficiently' ),
		translate( 'Create custom return/warranty forms' ),
		translate( 'Automate return approval processes' ),
		translate( 'Generate return labels and track return shipments' ),
	];
	const woocommerceSubscriptionDownloadsBenefits = [
		translate( 'Offer downloadable content on a subscription basis' ),
		translate( 'Control access to files based on subscription status' ),
		translate( 'Set download limits and expiration dates' ),
		translate( 'Integrate with membership plugins for advanced access control' ),
	];
	const woocommerceShipmentTrackingBenefits = [
		translate( 'Add shipment tracking information to orders' ),
		translate( 'Keep customers informed about order status and delivery' ),
		translate( 'Integrate with major shipping carriers' ),
		translate( 'Automatically send tracking emails to customers' ),
	];
	const woocommerceShippingMultipleAddressesBenefits = [
		translate( 'Allow customers to ship items to multiple addresses in one order' ),
		translate( 'Set up different shipping methods for each address' ),
		translate( 'Calculate shipping costs separately for each destination' ),
	];
	const woocommerceStorefrontExtensionsBundleBenefits = [
		translate( 'Enhance Storefront theme functionality' ),
		translate( 'Add various design and layout improvements' ),
		translate( 'Include multiple Storefront-specific plugins' ),
		translate( 'Improve site performance with optimized extensions' ),
	];
	const woocommerceTableRateShippingBenefits = [
		translate( 'Create complex shipping rules based on various factors' ),
		translate( 'Offer flexible shipping rates tailored to specific needs' ),
		translate( 'Set up shipping zones with custom rates' ),
		translate( 'Use conditions like weight, price, item count, or shipping class' ),
	];
	const woocommerceAdditionalImageVariationsBenefits = [
		translate( 'Add multiple images for product variations' ),
		translate( 'Improve product presentation for variable products' ),
		translate( 'Display variation-specific image galleries' ),
		translate( 'Easily manage variation images from the product editor' ),
	];
	const woocommerceBookingsAvailabilityBenefits = [
		translate( 'Display availability calendars for bookable products' ),
		translate( 'Manage capacity and scheduling for services or rentals' ),
		translate( 'Set up complex availability rules' ),
		translate( 'Allow customers to check real-time availability' ),
	];
	const woocommerceBoxOfficeBenefits = [
		translate( 'Sell tickets for events' ),
		translate( 'Manage attendee information and check-ins' ),
		translate( 'Create printable or digital tickets' ),
		translate( 'Set up seating charts and ticket types' ),
	];
	const woocommerceBrandsBenefits = [
		translate( 'Organize products by brand' ),
		translate( 'Improve product filtering and navigation' ),
		translate( 'Create brand pages with custom content' ),
		translate( 'Display brand logos on product pages and in widgets' ),
	];
	const woocommerceCouponCampaignsBenefits = [
		translate( 'Create and manage advanced coupon campaigns' ),
		translate( 'Boost sales with targeted promotions' ),
		translate( 'Set up time-limited or usage-limited coupons' ),
		translate( 'Create bulk coupon codes for mass distribution' ),
	];
	const woocommerceDepositsBenefits = [
		translate( 'Allow customers to pay deposits on orders' ),
		translate( 'Manage partial payments and payment plans' ),
		translate( 'Set up fixed or percentage-based deposits' ),
		translate( 'Configure automatic billing for remaining balances' ),
	];
	const woocommerceDistanceRateShippingBenefits = [
		translate( 'Calculate shipping rates based on distance' ),
		translate( 'Offer location-based shipping costs' ),
		translate( 'Integrate with mapping services for distance calculation' ),
		translate( 'Set up distance-based pricing tiers' ),
	];
	const woocommerceOnePageCheckoutBenefits = [
		translate( 'Streamline checkout process to a single page' ),
		translate( 'Improve conversion rates with simplified purchasing' ),
		translate( 'Customize checkout page layout' ),
		translate( 'Add product selection directly to the checkout page' ),
	];
	const woocommerceOrderBarcodesBenefits = [
		translate( 'Generate barcodes for orders' ),
		translate( 'Simplify order processing and tracking' ),
		translate( 'Print barcodes on packing slips or labels' ),
		translate( 'Scan barcodes to quickly access order details' ),
	];
	const woocommercePointsAndRewardsBenefits = [
		translate( 'Implement a customer loyalty program' ),
		translate( 'Reward customers with points for purchases and actions' ),
		translate( 'Set up point earning and redemption rules' ),
		translate( 'Create tiered reward levels for VIP customers' ),
	];
	const woocommercePreOrdersBenefits = [
		translate( 'Allow customers to pre-order upcoming products' ),
		translate( 'Manage and fulfill pre-orders efficiently' ),
		translate( 'Set release dates and charge options' ),
		translate( 'Automatically update order status on release date' ),
	];
	const woocommercePurchaseOrderGatewayBenefits = [
		translate( 'Accept purchase orders as a payment method' ),
		translate( 'Cater to B2B customers with specific payment needs' ),
		translate( 'Set up custom approval processes for purchase orders' ),
		translate( 'Generate invoices for approved purchase orders' ),
	];
	const woocommerceShippingBenefits = [
		translate( 'Print USPS and DHL labels' ),
		translate( 'Streamline shipping process with carrier integration' ),
		translate( 'Compare rates from multiple carriers' ),
		translate( 'Automatically mark orders as completed upon shipping' ),
	];
	const woocommerceAccommodationsBookingsBenefits = [
		translate( 'Manage bookings for accommodations' ),
		translate( 'Handle reservations for hotels, rentals, etc' ),
		translate( 'Set up room types and rates' ),
		translate( 'Manage seasonal pricing and availability' ),
	];
	const woocommerceTaxBenefits = [
		translate( 'Automate sales tax calculations' ),
		translate( 'Ensure compliance with tax regulations' ),
		translate( 'Integrate with major tax calculation services' ),
		translate( 'Generate tax reports for easy filing' ),
	];
	const woocommerceWoopaymentsBenefits = [
		translate(
			'WooPayments is available {{a}}in 38 countries{{/a}} and accepts payments in 135+ currencies, no other extensions needed.',
			{
				components: {
					a: getLink( 'https://woocommerce.com/products/woopayments/' ),
				},
			}
		),
		translate(
			'Get started for free. Pay-as-you-go fees per transaction. There are no monthly fees, either. {{a}}Learn more about our fees{{/a}}.',
			{
				components: {
					a: getLink( 'https://woocommerce.com/document/woopayments/fees-and-debits/fees/' ),
				},
			}
		),
		translate(
			'Try Tap to Pay or {{OrderCardReaderLink}}order a card reader{{/OrderCardReaderLink}} that syncs with your inventory through WooPayments. {{LearnMoreLink}}Learn more about Tap to Pay on iPhone and Android{{/LearnMoreLink}}.',
			{
				components: {
					OrderCardReaderLink: getLink( 'https://woocommerce.com/in-person-payments/' ),
					LearnMoreLink: getLink( 'https://woocommerce.com/tap-to-pay/' ),
				},
			}
		),
		translate(
			'Multi-Currency support is built-in. Accept payments in 135+ currencies using WooPayments.'
		),
		translate(
			'Increase conversions by enabling payment methods including {{WooPayLink}}WooPay{{/WooPayLink}}, {{ApplePayLink}}Apple Pay®{{/ApplePayLink}}, {{GooglePayLink}}Google Pay{{/GooglePayLink}}, {{IDealLink}}iDeal{{/IDealLink}}, {{P24Link}}P24{{/P24Link}}, {{EPSLink}}EPS{{/EPSLink}}, and {{BancontactLink}}Bancontact{{/BancontactLink}}.',
			{
				components: {
					WooPayLink: getLink( 'https://woocommerce.com/woopay-businesses/' ),
					ApplePayLink: getLink(
						'https://woocommerce.com/document/woopayments/payment-methods/apple-pay/'
					),
					GooglePayLink: getLink(
						'https://woocommerce.com/document/woopayments/payment-methods/google-pay/'
					),
					IDealLink: getLink( 'https://woocommerce.com/woocommerce-payments-ideal/' ),
					P24Link: getLink( 'https://woocommerce.com/woopayments-p24/' ),
					EPSLink: getLink( 'https://woocommerce.com/woocommerce-payments-eps/' ),
					BancontactLink: getLink( 'https://woocommerce.com/woocommerce-payments-bancontact/' ),
				},
			}
		),
		translate(
			'Enable buy now, pay later (BNPL) in one click. Sell more and reach new customers with {{a}}top BNPL options{{/a}} built into your dashboard (not available in all geographies).',
			{
				components: {
					a: getLink( 'https://woocommerce.com/buy-now-pay-later/' ),
				},
			}
		),
		translate(
			"Simplify your workflow. No more logging into third-party payment processor sites - manage everything from the comfort of your store's dashboard."
		),
		translate(
			'Set a custom payout schedule to get your funds into your bank account as often as you need — daily, weekly, monthly, or even on-demand.'
		),
		translate( 'Reduce cart abandonment with a streamlined checkout flow.' ),
		translate(
			'Stay on top of chargebacks, disputes, and refunds thanks to the integrated dashboard.'
		),
		translate(
			'Stay on top of chargebacks, disputes, and refunds thanks to the integrated dashboard.'
		),
	];
	const woocommerceProductFiltersBenefits = [
		translate( 'Create ajax product filters for quick and simple product search' ),
		translate( 'Filter by categories, attributes, tags, taxonomies, price, and stock status' ),
		translate( 'Use AJAX technology for fast filtering without page reloads' ),
		translate(
			'Offer multiple filter elements: price slider, checkbox list, radio list, dropdown, color list, box list, text list, and more'
		),
		translate( 'Provide widgets for "Products Filter" and "Notes for Product Filters"' ),
		translate( 'Include shortcodes and integration with product shortcodes' ),
		translate( 'Feature adaptive filter options and product counts' ),
		translate( 'Display adaptive product thumbnails' ),
		translate( 'Easy 5-minute setup for beginners and developers' ),
		translate( 'Improve user experience by helping customers find products quickly' ),
		translate( 'Increase sales by directing customers to desired products' ),
		translate( 'Allow expansion of inventory without confusing customers' ),
		translate( 'Potentially boost SEO when implemented correctly' ),
	];

	const woocommerceConstellationBenefits = [
		translate(
			'Integrates seamlessly with WooCommerce to manage memberships, offering perks like exclusive content and discounts.'
		),
		translate( 'Supports publishers, purchasing clubs, online learning, associations, and more.' ),
		translate(
			'Offers one-time payments, recurring billing, and free trials to suit various business models.'
		),
		translate(
			'Schedules access to content over time, enhancing member engagement and retention.'
		),
		translate( 'Allows unlimited membership plans and unlimited members without restrictions.' ),
	];

	const woocommerceRentalProductsBenefits = [
		translate(
			'Enables the sale and management of rental products with advanced pricing, availability, and deposit options.'
		),
		translate(
			'Allows customers to select rental dates via a calendar, calculate costs, and add items to their cart.'
		),
		translate(
			'Provides a rentals dashboard with summaries, calendars, inventory management, and tools for efficient oversight.'
		),
		translate(
			'Sends return reminder emails to customers, ensuring timely returns and improved inventory management.'
		),
		translate(
			'Supports both shipped rentals and in-person pick-up/returns, accommodating various business models.'
		),
	];

	const woocommerceSmartCouponsBenefits = [
		translate(
			'Creates dynamic pricing rules, bulk discounts, and percentage-based offers to boost sales.'
		),
		translate(
			'Sells gift cards with scheduling options, enhancing customer loyalty and increasing revenue.'
		),
		translate(
			'Easily sets up "Buy One, Get One" promotions and offers free gifts based on customizable rules.'
		),
		translate( 'Generates, exports, and emails thousands of unique coupon codes efficiently.' ),
		translate(
			'Creates shareable links that auto-apply discounts, simplifying the customer experience and increasing conversions.'
		),
	];

	const woocommerceDynamicPricingBenefits = [
		translate(
			'Sets up bulk discounts for products with flexible pricing adjustments, including fixed or percentage.'
		),
		translate(
			'Offers discounts based on user roles, allowing for targeted pricing strategies for different customer segments.'
		),
		translate(
			'Applies bulk discounts across entire product categories, streamlining promotional efforts.'
		),
		translate(
			'Allows custom quantity calculations for pricing rules, accommodating various sales strategies.'
		),
	];

	const woocommerceVariationSwatchesAndPhotosBenefits = [
		translate(
			'Replaces dropdowns with color and image swatches, providing a more intuitive and visually appealing shopping experience.'
		),
		translate(
			'Defines colors and images at both attribute and product levels, offering flexibility in product display.'
		),
		translate(
			'Allows customers to view product variations more clearly, aiding in decision-making and reducing return rates.'
		),
		translate( 'Integrates smoothly with WooCommerce, ensuring compatibility and ease of use.' ),
		translate(
			'Enhances product listings by showcasing variations in color, size, style, or any other attribute.'
		),
	];

	const monitorBenefits = [
		translate(
			'Rapid detection: With our 1-minute interval monitoring, we detect potential issues faster than ever before.'
		),
		translate(
			'Multi-channel alerts: Get notified immediately when a site that you manage is down via SMS and email (multiple recipients).'
		),
		translate(
			'Enhanced uptime: Experience less downtime and increased service reliability through prompt response and resolution.'
		),
		translate( 'Reduce potential revenue losses because your site went down.' ),
	];

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantBenefits,
		[ PRODUCT_JETPACK_AI_YEARLY ]: aiAssistantBenefits,
		[ PRODUCT_JETPACK_AI_BI_YEARLY ]: aiAssistantBenefits,
		[ PRODUCT_JETPACK_CREATOR_MONTHLY ]: creatorBenefits,
		[ PRODUCT_JETPACK_CREATOR_YEARLY ]: creatorBenefits,
		[ PRODUCT_JETPACK_CREATOR_BI_YEARLY ]: creatorBenefits,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY ]: videoPressBenefits,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressBenefits,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressBenefits,
		[ PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY ]: antiSpamBenefits,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamBenefits,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamBenefits,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanBenefits,
		[ PRODUCT_JETPACK_SEARCH_BI_YEARLY ]: searchBenefits,
		[ PRODUCT_JETPACK_SEARCH ]: searchBenefits,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchBenefits,
		[ PRODUCT_JETPACK_BOOST_BI_YEARLY ]: boostBenefits,
		[ PRODUCT_JETPACK_BOOST ]: boostBenefits,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostBenefits,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ]: socialBasicBenefits,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialBasicBenefits,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialBasicBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY ]: socialBenefits,
		[ PRODUCT_JETPACK_SOCIAL_V1_YEARLY ]: socialBenefits,
		[ PRODUCT_JETPACK_SOCIAL_V1_MONTHLY ]: socialBenefits,
		[ PRODUCT_JETPACK_STATS_BI_YEARLY ]: statsCommercialBenefits,
		[ PRODUCT_JETPACK_STATS_YEARLY ]: statsCommercialBenefits,
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: statsCommercialBenefits,
		[ PRODUCT_JETPACK_MONITOR_YEARLY ]: monitorBenefits,
		[ PRODUCT_JETPACK_MONITOR_MONTHLY ]: monitorBenefits,
		[ PRODUCT_WOOCOMMERCE_BOOKINGS ]: woocommerceBookingsBenefits,
		[ PRODUCT_WOOCOMMERCE_SUBSCRIPTIONS ]: woocommerceSubscriptionsBenefits,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_BUNDLES ]: woocommerceProductBundlesBenefits,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_ADD_ONS ]: woocommerceProductAddOnsBenefits,
		[ PRODUCT_WOOCOMMERCE_MINMAX_QUANTITIES ]: woocommerceMinMaxQuantitiesBenefits,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO ]: woocommerceAutomateWooBenefits,
		[ PRODUCT_WOOCOMMERCE_ADVANCED_NOTIFICATIONS ]: woocommerceAdvancedNotificationsBenefits,
		[ PRODUCT_WOOCOMMERCE_ALL_PRODUCTS_WOO_SUBSCRIPTIONS ]:
			woocommerceAllProductsWooSubscriptionsBenefits,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO_BIRTHDAYS ]: woocommerceAutomatewooBirthdaysBenefits,
		[ PRODUCT_WOOCOMMERCE_AUTOMATEWOO_REFER_A_FRIEND ]: woocommerceAutomatewooReferAFriendBenefits,
		[ PRODUCT_WOOCOMMERCE_BACK_IN_STOCK_NOTIFICATIONS ]:
			woocommerceBackInStockNotificationsBenefits,
		[ PRODUCT_WOOCOMMERCE_BULK_STOCK_MANAGEMENT ]: woocommerceBulkStockManagementBenefits,
		[ PRODUCT_WOOCOMMERCE_CHECKOUT_FIELD_EDITOR ]: woocommerceCheckoutFieldEditorBenefits,
		[ PRODUCT_WOOCOMMERCE_COMPOSITE_PRODUCTS ]: woocommerceCompositeProductsBenefits,
		[ PRODUCT_WOOCOMMERCE_CONDITIONAL_SHIPPING_PAYMENTS ]:
			woocommerceConditionalShippingPaymentsBenefits,
		[ PRODUCT_WOOCOMMERCE_EU_VAT_NUMBER ]: woocommerceEuVatNumberBenefits,
		[ PRODUCT_WOOCOMMERCE_FLAT_RATE_BOX_SHIPPING ]: woocommerceFlatRateBoxShippingBenefits,
		[ PRODUCT_WOOCOMMERCE_GIFT_CARDS ]: woocommerceGiftCardsBenefits,
		[ PRODUCT_WOOCOMMERCE_GIFTING_WC_SUBSCRIPTIONS ]: woocommerceGiftingWcSubscriptionsBenefits,
		[ PRODUCT_WOOCOMMERCE_PER_PRODUCT_SHIPPING ]: woocommercePerProductShippingBenefits,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_CSV_IMPORT_SUITE ]: woocommerceProductCsvImportSuiteBenefits,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_RECOMMENDATIONS ]: woocommerceProductRecommendationsBenefits,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_VENDORS ]: woocommerceProductVendorsBenefits,
		[ PRODUCT_WOOCOMMERCE_RETURNS_WARRANTY_REQUESTS ]: woocommerceReturnsWarrantyRequestsBenefits,
		[ PRODUCT_WOOCOMMERCE_SUBSCRIPTION_DOWNLOADS ]: woocommerceSubscriptionDownloadsBenefits,
		[ PRODUCT_WOOCOMMERCE_SHIPMENT_TRACKING ]: woocommerceShipmentTrackingBenefits,
		[ PRODUCT_WOOCOMMERCE_SHIPPING_MULTIPLE_ADDRESSES ]:
			woocommerceShippingMultipleAddressesBenefits,
		[ PRODUCT_WOOCOMMERCE_STOREFRONT_EXTENSIONS_BUNDLE ]:
			woocommerceStorefrontExtensionsBundleBenefits,
		[ PRODUCT_WOOCOMMERCE_TABLE_RATE_SHIPPING ]: woocommerceTableRateShippingBenefits,
		[ PRODUCT_WOOCOMMERCE_ADDITIONAL_IMAGE_VARIATIONS ]:
			woocommerceAdditionalImageVariationsBenefits,
		[ PRODUCT_WOOCOMMERCE_BOOKINGS_AVAILABILITY ]: woocommerceBookingsAvailabilityBenefits,
		[ PRODUCT_WOOCOMMERCE_BOX_OFFICE ]: woocommerceBoxOfficeBenefits,
		[ PRODUCT_WOOCOMMERCE_BRANDS ]: woocommerceBrandsBenefits,
		[ PRODUCT_WOOCOMMERCE_COUPON_CAMPAIGNS ]: woocommerceCouponCampaignsBenefits,
		[ PRODUCT_WOOCOMMERCE_DEPOSITS ]: woocommerceDepositsBenefits,
		[ PRODUCT_WOOCOMMERCE_DISTANCE_RATE_SHIPPING ]: woocommerceDistanceRateShippingBenefits,
		[ PRODUCT_WOOCOMMERCE_ONE_PAGE_CHECKOUT ]: woocommerceOnePageCheckoutBenefits,
		[ PRODUCT_WOOCOMMERCE_ORDER_BARCODES ]: woocommerceOrderBarcodesBenefits,
		[ PRODUCT_WOOCOMMERCE_POINTS_AND_REWARDS ]: woocommercePointsAndRewardsBenefits,
		[ PRODUCT_WOOCOMMERCE_PRE_ORDERS ]: woocommercePreOrdersBenefits,
		[ PRODUCT_WOOCOMMERCE_PURCHASE_ORDER_GATEWAY ]: woocommercePurchaseOrderGatewayBenefits,
		[ PRODUCT_WOOCOMMERCE_SHIPPING ]: woocommerceShippingBenefits,
		[ PRODUCT_WOOCOMMERCE_ACCOMMODATIONS_BOOKINGS ]: woocommerceAccommodationsBookingsBenefits,
		[ PRODUCT_WOOCOMMERCE_TAX ]: woocommerceTaxBenefits,
		[ PRODUCT_WOOCOMMERCE_WOOPAYMENTS ]: woocommerceWoopaymentsBenefits,
		[ PRODUCT_WOOCOMMERCE_PRODUCT_FILTERS ]: woocommerceProductFiltersBenefits,
		[ PRODUCT_WOOCOMMERCE_CONSTELLATION ]: woocommerceConstellationBenefits,
		[ PRODUCT_WOOCOMMERCE_RENTAL_PRODUCTS ]: woocommerceRentalProductsBenefits,
		[ PRODUCT_WOOCOMMERCE_SMART_COUPONS ]: woocommerceSmartCouponsBenefits,
		[ PRODUCT_WOOCOMMERCE_DYNAMIC_PRICING ]: woocommerceDynamicPricingBenefits,
		[ PRODUCT_WOOCOMMERCE_VARIATION_SWATCHES_AND_PHOTOS ]:
			woocommerceVariationSwatchesAndPhotosBenefits,
	};
};

export const getJetpackProductsBenefitsComingSoon = (): Record<
	string,
	Array< TranslateResult >
> => {
	const socialAdvancedBenefits = [ translate( 'Share multiple images to social media' ) ];

	return {
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedBenefits,
	};
};

export const getJetpackProductsFAQs = (
	getHelpLink: ( context: unknown ) => JSX.Element,
	getSupportLink: ( context: unknown ) => JSX.Element
): Record< string, Array< FAQ > > => {
	const cancellationPolicyFAQ = {
		id: 'cancellation-policy',
		question: translate( 'What is your cancellation policy?' ),
		answer: translate(
			'If you are dissatisfied for any reason, we offer full refunds within %(annualDays)d days for yearly plans, and within %(monthlyDays)d days for monthly plans. If you have a question about our paid plans, {{helpLink}}please let us know{{/helpLink}}!',
			{
				args: { annualDays: 14, monthlyDays: 7 },
				components: { helpLink: getHelpLink( 'cancellation' ) },
			}
		),
	};

	const backupFAQs: Array< FAQ > = [
		{
			id: 'backup-storage-limits-lightbox',
			question: translate( 'How do backup storage limits work?' ),
			answer: translate(
				'If your backup storage limit is reached, older backups will be deleted and, depending on your site’s size, the backup retention period (archive) might be reduced to %(monthlyDays)d days. This will affect how far back you can see backups in your activity log. Existing backups can still be restored, but new updates won’t be backed up until you upgrade or free up storage.',
				{
					args: { monthlyDays: 7 },
				}
			),
		},
		cancellationPolicyFAQ,
	];

	const scanFAQs: Array< FAQ > = [
		{
			id: 'scan-infected-sites',
			question: translate( 'Can I use Jetpack Scan to fix a site that is already infected?' ),
			answer: translate(
				'Jetpack Protect (Scan) detects and prevents attacks, but is not designed to fully clean up sites infected before it was active. If your site has malware, take immediate action to clean it up and remove the malicious code. {{br/}} To clean up your site, we suggest using a malware removal tool, or if possible restore from a backup taken before the infection. We recommend using Jetpack VaultPress Backup in conjunction with Jetpack Scan to secure your website. {{br/}} {{JetpackScanLearnMoreLink}}Learn more about cleaning your site{{/JetpackScanLearnMoreLink}}.',
				{
					components: {
						br: <br />,
						JetpackScanLearnMoreLink: getSupportLink( 'how-to-clean-your-hacked-wordpress-site' ),
					},
				}
			),
		},
		cancellationPolicyFAQ,
	];

	return {
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: backupFAQs,
		[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: backupFAQs,
		[ PLAN_JETPACK_COMPLETE ]: backupFAQs,
		[ PLAN_JETPACK_COMPLETE_MONTHLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupFAQs,
		[ PRODUCT_JETPACK_SCAN_BI_YEARLY ]: scanFAQs,
		[ PRODUCT_JETPACK_SCAN ]: scanFAQs,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanFAQs,
	};
};

export const getJetpackPlansAlsoIncludedFeatures = (): Record<
	string,
	Array< TranslateResult >
> => {
	const socialFree = [ translate( 'Social (free tier)' ) ];
	const videoPressFree = [ translate( 'VideoPress (free tier)' ) ];
	const freeBundleFeatures = [
		translate( 'Brute force attack protection' ),
		translate( 'Downtime monitoring' ),
		translate( 'CDN (Content Delivery Networks)' ),
	];
	const growthPlanIncludesInfo = [
		translate( 'Display ads with WordAds' ),
		translate( 'Pay with PayPal' ),
		translate( 'Paid content gating' ),
		translate( 'Paywall access' ),
		translate( 'Newsletter' ),
		translate( 'Priority support' ),
		translate( '%(transactionFee)s transaction fees', {
			args: {
				transactionFee: formatNumber( 0.02, {
					numberFormatOptions: { style: 'percent' },
				} ),
			},
		} ),
	];

	return {
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: [ ...growthPlanIncludesInfo, ...freeBundleFeatures ],
		[ PLAN_JETPACK_COMPLETE ]: [ ...growthPlanIncludesInfo, ...freeBundleFeatures ],
		[ PLAN_JETPACK_COMPLETE_MONTHLY ]: [ ...growthPlanIncludesInfo, ...freeBundleFeatures ],
		[ PLAN_JETPACK_GROWTH_MONTHLY ]: [ ...growthPlanIncludesInfo, ...freeBundleFeatures ],
		[ PLAN_JETPACK_GROWTH_YEARLY ]: [ ...growthPlanIncludesInfo, ...freeBundleFeatures ],
		[ PLAN_JETPACK_GROWTH_BI_YEARLY ]: [ ...growthPlanIncludesInfo, ...freeBundleFeatures ],
	};
};

export const getJetpackProductsRecommendedFor = (): Record< string, TranslateResult > => {
	return {
		[ JETPACK_TAG_FOR_WOOCOMMERCE_STORES ]: translate( 'WooCommerce stores' ),
		[ JETPACK_TAG_FOR_NEWS_ORGANISATIONS ]: translate( 'News organizations' ),
		[ JETPACK_TAG_FOR_MEMBERSHIP_SITES ]: translate( 'Membership sites' ),
		[ JETPACK_TAG_FOR_ONLINE_FORUMS ]: translate( 'Online forums' ),
		[ JETPACK_TAG_FOR_BLOGS ]: translate( 'Blogs' ),
		[ JETPACK_TAG_FOR_VIDEOGRAPHERS ]: translate( 'Videographers' ),
		[ JETPACK_TAG_FOR_EDUCATORS ]: translate( 'Educators' ),
		[ JETPACK_TAG_FOR_BLOGGERS ]: translate( 'Bloggers' ),
		[ JETPACK_TAG_FOR_ALL_SITES ]: translate( 'All sites' ),
	};
};

export const useJetpack10GbStorageAmountText = (): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
				comment:
					'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
				count: 10,
				args: { numberOfGigabytes: 10 },
			} ),
		[ translate ]
	);
};

export const useJetpack100GbStorageAmountText = (): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
				comment:
					'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
				count: 100,
				args: { numberOfGigabytes: 100 },
			} ),
		[ translate ]
	);
};

export const useJetpack1TbStorageAmountText = (): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
				comment:
					'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
				count: 1,
				args: { numberOfTerabytes: 1 },
			} ),
		[ translate ]
	);
};

export const useJetpackGbStorageAmountText = ( amount: number ): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
				comment:
					'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
				count: amount,
				args: { numberOfGigabytes: amount },
			} ),
		[ translate, amount ]
	);
};

export const useJetpackTbStorageAmountText = ( amount: number ): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
				comment:
					'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
				count: amount,
				args: { numberOfTerabytes: amount },
			} ),
		[ translate, amount ]
	);
};

export const useJetpackStorageAmountTextByProductSlug = (): ( (
	slug: string
) => TranslateResult | undefined ) => {
	const ONE_GIGABYTE = useJetpackGbStorageAmountText( 1 );
	const TEN_GIGABYTES = useJetpackGbStorageAmountText( 10 );
	const HUNDRED_GIGABYTES = useJetpackGbStorageAmountText( 100 );
	const ONE_TERABYTE = useJetpackTbStorageAmountText( 1 );
	const THREE_TERABYTE = useJetpackTbStorageAmountText( 3 );
	const FIVE_TERABYTE = useJetpackTbStorageAmountText( 5 );

	return useCallback(
		( productSlug ) =>
			( {
				[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: ONE_GIGABYTE,
				[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: ONE_GIGABYTE,
				[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: ONE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: ONE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: HUNDRED_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: ONE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY ]: THREE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY ]: FIVE_TERABYTE,

				[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: TEN_GIGABYTES,
				[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: TEN_GIGABYTES,
				[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: TEN_GIGABYTES,
				[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: ONE_TERABYTE,
				[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: ONE_TERABYTE,
			} )[ productSlug ],
		[ ONE_GIGABYTE, TEN_GIGABYTES, HUNDRED_GIGABYTES, ONE_TERABYTE, THREE_TERABYTE, FIVE_TERABYTE ]
	);
};
