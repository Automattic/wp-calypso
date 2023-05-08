import { translate } from 'i18n-calypso';
import {
	FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	FEATURE_SPAM_10K_PER_MONTH,
	FEATURE_AKISMET_V2,
	FEATURE_ANTISPAM_V2,
	FEATURE_WAF,
	FEATURE_BACKUP_DAILY_V2,
	FEATURE_BACKUP_REALTIME_V2,
	FEATURE_CLOUD_CRITICAL_CSS,
	FEATURE_FILTERING_V2,
	FEATURE_INSTANT_EMAIL_V2,
	FEATURE_JETPACK_1TB_BACKUP_STORAGE,
	FEATURE_JETPACK_1GB_BACKUP_STORAGE,
	FEATURE_JETPACK_10GB_BACKUP_STORAGE,
	FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_JETPACK_VIDEOPRESS_EDITOR,
	FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
	FEATURE_JETPACK_VIDEOPRESS_STORAGE,
	FEATURE_LANGUAGE_SUPPORT_V2,
	FEATURE_ONE_CLICK_FIX_V2,
	FEATURE_ONE_CLICK_RESTORE_V2,
	FEATURE_SCAN_V2,
	FEATURE_SEARCH_V2,
	FEATURE_SECURE_STORAGE_V2,
	FEATURE_SPAM_BLOCK_V2,
	FEATURE_SPELLING_CORRECTION_V2,
	FEATURE_SUPPORTS_WOOCOMMERCE_V2,
	PLAN_ANNUAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
	FEATURE_SOCIAL_SHARES_1000,
	FEATURE_SOCIAL_ENHANCED_PUBLISHING,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	JETPACK_SECURITY_CATEGORY,
	JETPACK_PERFORMANCE_CATEGORY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
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
} from './constants';
import { getJetpackProductsShortNames } from './translations';
import type { ProductSlug, JetpackProductSlug, WPComProductSlug, Product } from './types';

const PRODUCT_SHORT_NAMES = getJetpackProductsShortNames();

export const JETPACK_SITE_PRODUCTS_WITH_FEATURES: Record<
	Exclude< JetpackProductSlug, WPComProductSlug >,
	Product
> = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_BACKUP_DAILY ],
		product_slug: PRODUCT_JETPACK_BACKUP_DAILY,
		type: PRODUCT_JETPACK_BACKUP_DAILY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_BACKUP_DAILY_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
		],
		getProductId: () => 2100,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_DAILY,
	},
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ],
		product_slug: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_DAILY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_BACKUP_DAILY_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
		],
		getProductId: () => 2101,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_BACKUP_REALTIME ],
		product_slug: PRODUCT_JETPACK_BACKUP_REALTIME,
		type: PRODUCT_JETPACK_BACKUP_REALTIME,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_BACKUP_REALTIME_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
			FEATURE_ACTIVITY_LOG_1_YEAR_V2,
		],
		getProductId: () => 2102,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_REALTIME,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
		product_slug: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_REALTIME,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_BACKUP_REALTIME_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
			FEATURE_ACTIVITY_LOG_1_YEAR_V2,
		],
		getProductId: () => 2103,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	},
	[ PRODUCT_JETPACK_SCAN ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_SCAN ],
		product_slug: PRODUCT_JETPACK_SCAN,
		type: PRODUCT_JETPACK_SCAN,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_SCAN_V2,
			FEATURE_ONE_CLICK_FIX_V2,
			FEATURE_INSTANT_EMAIL_V2,
			FEATURE_WAF,
		],
		getProductId: () => 2106,
		getStoreSlug: () => PRODUCT_JETPACK_SCAN,
	},
	[ PRODUCT_JETPACK_SCAN_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_SCAN_MONTHLY ],
		product_slug: PRODUCT_JETPACK_SCAN_MONTHLY,
		type: PRODUCT_JETPACK_SCAN,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_SCAN_V2,
			FEATURE_ONE_CLICK_FIX_V2,
			FEATURE_INSTANT_EMAIL_V2,
			FEATURE_WAF,
		],
		getProductId: () => 2107,
		getStoreSlug: () => PRODUCT_JETPACK_SCAN_MONTHLY,
	},
	// SCAN_REALTIME is not publically offered as an individual add-on product at this time
	[ PRODUCT_JETPACK_SCAN_REALTIME ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_SCAN_REALTIME ],
		product_slug: PRODUCT_JETPACK_SCAN_REALTIME,
		type: PRODUCT_JETPACK_SCAN_REALTIME,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [ FEATURE_SCAN_V2, FEATURE_ONE_CLICK_FIX_V2, FEATURE_INSTANT_EMAIL_V2 ],
		getProductId: () => 2108,
		getStoreSlug: () => PRODUCT_JETPACK_SCAN_REALTIME,
	},
	[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ],
		product_slug: PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
		type: PRODUCT_JETPACK_SCAN_REALTIME,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [ FEATURE_SCAN_V2, FEATURE_ONE_CLICK_FIX_V2, FEATURE_INSTANT_EMAIL_V2 ],
		getProductId: () => 2109,
		getStoreSlug: () => PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	},
	[ PRODUCT_JETPACK_SEARCH ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_SEARCH ],
		product_slug: PRODUCT_JETPACK_SEARCH,
		type: PRODUCT_JETPACK_SEARCH,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_PERFORMANCE_CATEGORY ],
		getFeatures: () => [
			FEATURE_SEARCH_V2,
			FEATURE_FILTERING_V2,
			FEATURE_LANGUAGE_SUPPORT_V2,
			FEATURE_SPELLING_CORRECTION_V2,
			FEATURE_SUPPORTS_WOOCOMMERCE_V2,
		],
		getProductId: () => 2104,
		getStoreSlug: () => PRODUCT_JETPACK_SEARCH,
	},
	[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_SEARCH_MONTHLY ],
		product_slug: PRODUCT_JETPACK_SEARCH_MONTHLY,
		type: PRODUCT_JETPACK_SEARCH,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_PERFORMANCE_CATEGORY ],
		getFeatures: () => [
			FEATURE_SEARCH_V2,
			FEATURE_FILTERING_V2,
			FEATURE_LANGUAGE_SUPPORT_V2,
			FEATURE_SPELLING_CORRECTION_V2,
			FEATURE_SUPPORTS_WOOCOMMERCE_V2,
		],
		getProductId: () => 2105,
		getStoreSlug: () => PRODUCT_JETPACK_SEARCH_MONTHLY,
	},
	[ PRODUCT_JETPACK_ANTI_SPAM ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_ANTI_SPAM ],
		product_slug: PRODUCT_JETPACK_ANTI_SPAM,
		type: PRODUCT_JETPACK_ANTI_SPAM,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_ANTISPAM_V2,
			FEATURE_AKISMET_V2,
			FEATURE_SPAM_BLOCK_V2,
			FEATURE_SPAM_10K_PER_MONTH,
		],
		getProductId: () => 2110,
		getStoreSlug: () => PRODUCT_JETPACK_ANTI_SPAM,
	},
	[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
		product_slug: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
		type: PRODUCT_JETPACK_ANTI_SPAM,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_ANTISPAM_V2,
			FEATURE_AKISMET_V2,
			FEATURE_SPAM_BLOCK_V2,
			FEATURE_SPAM_10K_PER_MONTH,
		],
		getProductId: () => 2111,
		getStoreSlug: () => PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: {
		product_name: translate( 'VaultPress Backup' ),
		product_slug: PRODUCT_JETPACK_BACKUP_T0_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_T0_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
			FEATURE_JETPACK_1GB_BACKUP_STORAGE,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		],
		getProductId: () => 2120,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: {
		product_name: translate( 'VaultPress Backup' ),
		product_slug: PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
			FEATURE_JETPACK_1GB_BACKUP_STORAGE,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		],
		getProductId: () => 2121,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: {
		product_name: translate( 'VaultPress Backup' ),
		product_slug: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
			FEATURE_JETPACK_10GB_BACKUP_STORAGE,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		],
		getProductId: () => 2112,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: {
		product_name: translate( 'VaultPress Backup' ),
		product_slug: PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
			FEATURE_JETPACK_10GB_BACKUP_STORAGE,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		],
		getProductId: () => 2113,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: {
		product_name: translate( 'VaultPress Backup' ),
		product_slug: PRODUCT_JETPACK_BACKUP_T2_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_T2_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
			FEATURE_JETPACK_1TB_BACKUP_STORAGE,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
		],
		getProductId: () => 2114,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: {
		product_name: translate( 'VaultPress Backup' ),
		product_slug: PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_T2_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_SECURITY_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
			FEATURE_JETPACK_1TB_BACKUP_STORAGE,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
		],
		getProductId: () => 2115,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	},
	[ PRODUCT_JETPACK_BOOST ]: {
		product_name: translate( 'Boost' ),
		product_slug: PRODUCT_JETPACK_BOOST,
		type: PRODUCT_JETPACK_BOOST,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getFeatures: () => [ FEATURE_CLOUD_CRITICAL_CSS ],
		getProductId: () => 2401,
		getStoreSlug: () => PRODUCT_JETPACK_BOOST,
	},
	[ PRODUCT_JETPACK_BOOST_MONTHLY ]: {
		product_name: translate( 'Boost' ),
		product_slug: PRODUCT_JETPACK_BOOST_MONTHLY,
		type: PRODUCT_JETPACK_BOOST,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getFeatures: () => [ FEATURE_CLOUD_CRITICAL_CSS ],
		getProductId: () => 2400,
		getStoreSlug: () => PRODUCT_JETPACK_BOOST_MONTHLY,
	},
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: {
		product_name: translate( 'Social Basic' ),
		product_slug: PRODUCT_JETPACK_SOCIAL_BASIC,
		type: PRODUCT_JETPACK_SOCIAL_BASIC,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getFeatures: () => [ FEATURE_SOCIAL_SHARES_1000 ],
		getProductId: () => 2503,
		getStoreSlug: () => PRODUCT_JETPACK_SOCIAL_BASIC,
	},
	[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: {
		product_name: translate( 'Social Basic' ),
		product_slug: PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
		type: PRODUCT_JETPACK_SOCIAL_BASIC,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getFeatures: () => [ FEATURE_SOCIAL_SHARES_1000 ],
		getProductId: () => 2504,
		getStoreSlug: () => PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	},
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: {
		product_name: translate( 'Social Advanced (Beta)' ),
		product_slug: PRODUCT_JETPACK_SOCIAL_ADVANCED,
		type: PRODUCT_JETPACK_SOCIAL_ADVANCED,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getFeatures: () => [ FEATURE_SOCIAL_SHARES_1000, FEATURE_SOCIAL_ENHANCED_PUBLISHING ],
		getProductId: () => 2602,
		getStoreSlug: () => PRODUCT_JETPACK_SOCIAL_ADVANCED,
	},
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: {
		product_name: translate( 'Social Advanced (Beta)' ),
		product_slug: PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
		type: PRODUCT_JETPACK_SOCIAL_ADVANCED,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getFeatures: () => [ FEATURE_SOCIAL_SHARES_1000, FEATURE_SOCIAL_ENHANCED_PUBLISHING ],
		getProductId: () => 2603,
		getStoreSlug: () => PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	},
	[ PRODUCT_JETPACK_VIDEOPRESS ]: {
		product_name: translate( 'VideoPress' ),
		product_slug: PRODUCT_JETPACK_VIDEOPRESS,
		type: PRODUCT_JETPACK_VIDEOPRESS,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_PERFORMANCE_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_VIDEOPRESS_STORAGE,
			FEATURE_JETPACK_VIDEOPRESS_EDITOR,
			FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
			FEATURE_JETPACK_VIDEOPRESS,
		],
		getProductId: () => 2116,
		getStoreSlug: () => PRODUCT_JETPACK_VIDEOPRESS,
	},
	[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: {
		product_name: translate( 'VideoPress' ),
		product_slug: PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
		type: PRODUCT_JETPACK_VIDEOPRESS,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_PERFORMANCE_CATEGORY ],
		getFeatures: () => [
			FEATURE_JETPACK_VIDEOPRESS_STORAGE,
			FEATURE_JETPACK_VIDEOPRESS_EDITOR,
			FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
			FEATURE_JETPACK_VIDEOPRESS,
		],
		getProductId: () => 2117,
		getStoreSlug: () => PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY ]: {
		product_name: translate( 'Add-on Storage (10GB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getProductId: () => 2041,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY ]: {
		product_name: translate( 'Add-on Storage (100GB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getProductId: () => 2045,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY ]: {
		product_name: translate( 'Add-on Storage (1TB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getProductId: () => 2049,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY ]: {
		product_name: translate( 'Add-on Storage (3TB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getProductId: () => 2053,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY ]: {
		product_name: translate( 'Add-on Storage (5TB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [],
		getProductId: () => 2057,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: {
		product_name: translate( 'Add-on Storage (10GB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getProductId: () => 2040,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: {
		product_name: translate( 'Add-on Storage (100GB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getProductId: () => 2044,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: {
		product_name: translate( 'Add-on Storage (1TB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getProductId: () => 2048,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY ]: {
		product_name: translate( 'Add-on Storage (3TB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getProductId: () => 2052,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	},
	[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY ]: {
		product_name: translate( 'Add-on Storage (5TB)' ),
		product_slug: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
		type: PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [],
		getProductId: () => 2056,
		getStoreSlug: () => PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
	},
};

export const PRODUCTS_LIST: Record< ProductSlug, Product > = {
	...JETPACK_SITE_PRODUCTS_WITH_FEATURES,
	[ PRODUCT_WPCOM_SEARCH ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_WPCOM_SEARCH ],
		product_slug: PRODUCT_WPCOM_SEARCH,
		type: PRODUCT_WPCOM_SEARCH,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		categories: [ JETPACK_PERFORMANCE_CATEGORY ],
		getProductId: () => 800,
		getStoreSlug: () => PRODUCT_WPCOM_SEARCH,
	},
	[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ PRODUCT_WPCOM_SEARCH_MONTHLY ],
		product_slug: PRODUCT_WPCOM_SEARCH_MONTHLY,
		type: PRODUCT_WPCOM_SEARCH,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		categories: [ JETPACK_PERFORMANCE_CATEGORY ],
		getProductId: () => 801,
		getStoreSlug: () => PRODUCT_WPCOM_SEARCH_MONTHLY,
	},
};

export function objectIsProduct( item: unknown ): item is Product {
	if ( item !== null && typeof item === 'object' ) {
		const product = item as Product;
		if ( product.product_slug && product.product_name && product.term && product.bill_period ) {
			return true;
		}
	}
	return false;
}
