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
} from 'lib/plans/constants';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ProductSlug, JetpackProductSlug } from './types';

const PRODUCT_SHORT_NAMES = getJetpackProductsShortNames();

export type Product = {
	product_name: string | TranslateResult;
	product_slug: string;
	term: typeof TERM_ANNUALLY | typeof TERM_MONTHLY;
	bill_period: typeof PLAN_ANNUAL_PERIOD | typeof PLAN_MONTHLY_PERIOD;
};

export const JETPACK_PRODUCTS_LIST: Record< JetpackProductSlug, Product > = {
	[ constants.PRODUCT_JETPACK_BACKUP_DAILY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_DAILY ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_DAILY,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_REALTIME ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_REALTIME,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_SCAN ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SCAN ],
		product_slug: constants.PRODUCT_JETPACK_SCAN,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_SCAN_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SCAN_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_SCAN_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_SEARCH ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SEARCH ],
		product_slug: constants.PRODUCT_JETPACK_SEARCH,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_SEARCH_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_SEARCH_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_SEARCH_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_ANTI_SPAM ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_ANTI_SPAM ],
		product_slug: constants.PRODUCT_JETPACK_ANTI_SPAM,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
		product_slug: constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
};

export const PRODUCTS_LIST: Record< ProductSlug, Product > = {
	...JETPACK_PRODUCTS_LIST,
	[ constants.PRODUCT_WPCOM_SEARCH ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_WPCOM_SEARCH ],
		product_slug: constants.PRODUCT_WPCOM_SEARCH,
		term: TERM_ANNUALLY,
		bill_period: PLAN_ANNUAL_PERIOD,
	},
	[ constants.PRODUCT_WPCOM_SEARCH_MONTHLY ]: {
		product_name: PRODUCT_SHORT_NAMES[ constants.PRODUCT_WPCOM_SEARCH_MONTHLY ],
		product_slug: constants.PRODUCT_WPCOM_SEARCH_MONTHLY,
		term: TERM_MONTHLY,
		bill_period: PLAN_MONTHLY_PERIOD,
	},
};
