/**
 * External dependencies
 */
import { isObject } from 'lodash';

/**
 * Internal dependencies
 */
import * as constants from './constants';
import { getJetpackProductsShortNames } from './translations';
import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	FEATURE_BACKUP_DAILY_V2,
	FEATURE_BACKUP_REALTIME_V2,
	FEATURE_ONE_CLICK_RESTORE_V2,
	FEATURE_SECURE_STORAGE_V2,
	FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	FEATURE_PRIORITY_SUPPORT_V2,
	FEATURE_SCAN_V2,
	FEATURE_ONE_CLICK_FIX_V2,
	FEATURE_INSTANT_EMAIL_V2,
	FEATURE_SEARCH_V2,
	FEATURE_ANTISPAM_V2,
	FEATURE_AUTOMATED_SPAM_PROTECTION_V2,
	FEATURE_AKISMET_V2,
	FEATURE_SPAM_BLOCK_V2,
	FEATURE_ADVANCED_STATS_V2,
	FEATURE_FILTERING_V2,
	FEATURE_LANGUAGE_SUPPORT_V2,
	FEATURE_SPELLING_CORRECTION_V2,
} from 'calypso/lib/plans/constants';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ProductSlug, JetpackProductSlug } from './types';

const PRODUCT_SHORT_NAMES = getJetpackProductsShortNames();

export type Product = {
	product_name: string | TranslateResult;
	product_slug: string;
	type: string;
	term: typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
	bill_period: typeof PLAN_ANNUAL_PERIOD | typeof PLAN_MONTHLY_PERIOD;
	getFeatures?: ( variation: string ) => string[];
};

export const JETPACK_PRODUCTS_LIST: Record< JetpackProductSlug, Product > = {
	[ constants.PRODUCT_JETPACK_BACKUP_DAILY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_DAILY ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_DAILY,
		type: constants.PRODUCT_JETPACK_BACKUP_DAILY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		getFeatures: (): string[] => [
			FEATURE_BACKUP_DAILY_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
		],
	},
	[ constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		type: constants.PRODUCT_JETPACK_BACKUP_DAILY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		getFeatures: (): string[] => [
			FEATURE_BACKUP_DAILY_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
		],
	},
	[ constants.PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_REALTIME ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_REALTIME,
		type: constants.PRODUCT_JETPACK_BACKUP_REALTIME,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		getFeatures: (): string[] => [
			FEATURE_BACKUP_REALTIME_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
			FEATURE_ACTIVITY_LOG_1_YEAR_V2,
			FEATURE_PRIORITY_SUPPORT_V2,
		],
	},
	[ constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		type: constants.PRODUCT_JETPACK_BACKUP_REALTIME,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		getFeatures: (): string[] => [
			FEATURE_BACKUP_REALTIME_V2,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_SECURE_STORAGE_V2,
			FEATURE_ACTIVITY_LOG_1_YEAR_V2,
			FEATURE_PRIORITY_SUPPORT_V2,
		],
	},
	[ constants.PRODUCT_JETPACK_SCAN ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SCAN ],
		product_slug: constants.PRODUCT_JETPACK_SCAN,
		type: constants.PRODUCT_JETPACK_SCAN,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		getFeatures: ( variant: string ): string[] =>
			( {
				spp: [ FEATURE_SCAN_V2, FEATURE_ONE_CLICK_FIX_V2, FEATURE_INSTANT_EMAIL_V2 ],
			}[ variant ] || [
				FEATURE_SCAN_V2,
				FEATURE_ONE_CLICK_FIX_V2,
				FEATURE_INSTANT_EMAIL_V2,
				FEATURE_PRIORITY_SUPPORT_V2,
			] ),
	},
	[ constants.PRODUCT_JETPACK_SCAN_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SCAN_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_SCAN_MONTHLY,
		type: constants.PRODUCT_JETPACK_SCAN,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		getFeatures: ( variant: string ): string[] =>
			( {
				spp: [ FEATURE_SCAN_V2, FEATURE_ONE_CLICK_FIX_V2, FEATURE_INSTANT_EMAIL_V2 ],
			}[ variant ] || [
				FEATURE_SCAN_V2,
				FEATURE_ONE_CLICK_FIX_V2,
				FEATURE_INSTANT_EMAIL_V2,
				FEATURE_PRIORITY_SUPPORT_V2,
			] ),
	},
	[ constants.PRODUCT_JETPACK_SEARCH ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SEARCH ],
		product_slug: constants.PRODUCT_JETPACK_SEARCH,
		type: constants.PRODUCT_JETPACK_SEARCH,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		getFeatures: ( variant: string ): string[] =>
			( {
				spp: [ FEATURE_SEARCH_V2, FEATURE_FILTERING_V2, FEATURE_LANGUAGE_SUPPORT_V2 ],
			}[ variant ] || [
				FEATURE_SEARCH_V2,
				FEATURE_FILTERING_V2,
				FEATURE_LANGUAGE_SUPPORT_V2,
				FEATURE_SPELLING_CORRECTION_V2,
				FEATURE_PRIORITY_SUPPORT_V2,
			] ),
	},
	[ constants.PRODUCT_JETPACK_SEARCH_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SEARCH_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_SEARCH_MONTHLY,
		type: constants.PRODUCT_JETPACK_SEARCH,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		getFeatures: ( variant: string ): string[] =>
			( {
				spp: [ FEATURE_SEARCH_V2, FEATURE_FILTERING_V2, FEATURE_LANGUAGE_SUPPORT_V2 ],
			}[ variant ] || [
				FEATURE_SEARCH_V2,
				FEATURE_FILTERING_V2,
				FEATURE_LANGUAGE_SUPPORT_V2,
				FEATURE_SPELLING_CORRECTION_V2,
				FEATURE_PRIORITY_SUPPORT_V2,
			] ),
	},
	[ constants.PRODUCT_JETPACK_ANTI_SPAM ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_ANTI_SPAM ],
		product_slug: constants.PRODUCT_JETPACK_ANTI_SPAM,
		type: constants.PRODUCT_JETPACK_ANTI_SPAM,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
		getFeatures: ( variant: string ): string[] =>
			( {
				spp: [ FEATURE_AUTOMATED_SPAM_PROTECTION_V2, FEATURE_AKISMET_V2, FEATURE_SPAM_BLOCK_V2 ],
			}[ variant ] || [
				FEATURE_ANTISPAM_V2,
				FEATURE_AKISMET_V2,
				FEATURE_SPAM_BLOCK_V2,
				FEATURE_ADVANCED_STATS_V2,
				FEATURE_PRIORITY_SUPPORT_V2,
			] ),
	},
	[ constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
		type: constants.PRODUCT_JETPACK_ANTI_SPAM,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
		getFeatures: ( variant: string ): string[] =>
			( {
				spp: [ FEATURE_AUTOMATED_SPAM_PROTECTION_V2, FEATURE_AKISMET_V2, FEATURE_SPAM_BLOCK_V2 ],
			}[ variant ] || [
				FEATURE_ANTISPAM_V2,
				FEATURE_AKISMET_V2,
				FEATURE_SPAM_BLOCK_V2,
				FEATURE_ADVANCED_STATS_V2,
				FEATURE_PRIORITY_SUPPORT_V2,
			] ),
	},
};

export const PRODUCTS_LIST: Record< ProductSlug, Product > = {
	...JETPACK_PRODUCTS_LIST,
	[ constants.PRODUCT_WPCOM_SEARCH ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_WPCOM_SEARCH ],
		product_slug: constants.PRODUCT_WPCOM_SEARCH,
		type: constants.PRODUCT_WPCOM_SEARCH,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_WPCOM_SEARCH_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_WPCOM_SEARCH_MONTHLY ],
		product_slug: constants.PRODUCT_WPCOM_SEARCH_MONTHLY,
		type: constants.PRODUCT_WPCOM_SEARCH,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
};

export function objectIsProduct( item: unknown ): item is Product {
	if ( isObject( item ) ) {
		const requiredKeys = [ 'product_slug', 'product_name', 'term', 'bill_period' ];
		return requiredKeys.every( ( k ) => k in item );
	}

	return false;
}
