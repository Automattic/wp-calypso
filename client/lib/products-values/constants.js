/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';

// Jetpack products constants
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';
export const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';
export const PRODUCT_WPCOM_SEARCH = 'wpcom_search';
export const PRODUCT_WPCOM_SEARCH_MONTHLY = 'wpcom_search_monthly';
export const PRODUCT_JETPACK_SCAN = 'jetpack_scan';
export const PRODUCT_JETPACK_SCAN_MONTHLY = 'jetpack_scan_monthly';
export const PRODUCT_JETPACK_SCAN_REALTIME = 'jetpack_scan_realtime';
export const PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY = 'jetpack_scan_realtime_monthly';
export const PRODUCT_JETPACK_ANTI_SPAM = 'jetpack_anti_spam';
export const PRODUCT_JETPACK_ANTI_SPAM_MONTHLY = 'jetpack_anti_spam_monthly';
export const PRODUCT_JETPACK_CRM = 'jetpack_crm';
export const PRODUCT_JETPACK_CRM_MONTHLY = 'jetpack_crm_monthly';

export const JETPACK_PRODUCTS_BY_TERM = [
	{
		yearly: PRODUCT_JETPACK_BACKUP_DAILY,
		monthly: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_BACKUP_REALTIME,
		monthly: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_SEARCH,
		monthly: PRODUCT_JETPACK_SEARCH_MONTHLY,
	},
	{
		yearly: PRODUCT_WPCOM_SEARCH,
		monthly: PRODUCT_WPCOM_SEARCH_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_SCAN,
		monthly: PRODUCT_JETPACK_SCAN_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_ANTI_SPAM,
		monthly: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_CRM,
		monthly: PRODUCT_JETPACK_CRM_MONTHLY,
	},
];

export const JETPACK_BACKUP_PRODUCTS_YEARLY = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = [
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = [
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

export const JETPACK_SEARCH_PRODUCTS = [
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
];

export const JETPACK_SCAN_PRODUCTS = [
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
];

export const JETPACK_CRM_PRODUCTS = [ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ];

export const JETPACK_ANTI_SPAM_PRODUCTS = [
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
];

export const JETPACK_PRODUCTS_LIST = [
	...JETPACK_BACKUP_PRODUCTS,
	...( isEnabled( 'jetpack/scan-product' ) ? JETPACK_SCAN_PRODUCTS : [] ),
	...( isEnabled( 'jetpack/anti-spam-product' ) ? JETPACK_ANTI_SPAM_PRODUCTS : [] ),
	...JETPACK_SEARCH_PRODUCTS,
];

// Jetpack Search tiers
export const JETPACK_SEARCH_TIER_UP_TO_100_RECORDS = 'up_to_100_records';
export const JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS = 'up_to_1k_records';
export const JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS = 'up_to_10k_records';
export const JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS = 'up_to_100k_records';
export const JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS = 'up_to_1m_records';
export const JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS = 'more_than_1m_records';

export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';
export const JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/search/';
export const JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/scan/';
export const JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/anti-spam/';

export const JETPACK_PRODUCT_PRICE_MATRIX = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SEARCH ]: {
		relatedProduct: PRODUCT_JETPACK_SEARCH_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SCAN ]: {
		relatedProduct: PRODUCT_JETPACK_SCAN_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_ANTI_SPAM ]: {
		relatedProduct: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
		ratio: 12,
	},
};

export const WPCOM_TRAFFIC_GUIDE = 'traffic-guide';
