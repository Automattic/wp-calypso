/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type * as constants from './constants';

export type JetpackProductSlug =
	| typeof constants.PRODUCT_JETPACK_BACKUP_DAILY
	| typeof constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY
	| typeof constants.PRODUCT_JETPACK_BACKUP_REALTIME
	| typeof constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
	| typeof constants.PRODUCT_JETPACK_SCAN
	| typeof constants.PRODUCT_JETPACK_SCAN_MONTHLY
	| typeof constants.PRODUCT_JETPACK_SEARCH
	| typeof constants.PRODUCT_JETPACK_SEARCH_MONTHLY
	| typeof constants.PRODUCT_JETPACK_ANTI_SPAM
	| typeof constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY;

export type WPComProductSlug =
	| typeof constants.PRODUCT_WPCOM_SEARCH
	| typeof constants.PRODUCT_WPCOM_SEARCH_MONTHLY;

export type ProductSlug = JetpackProductSlug | WPComProductSlug;
