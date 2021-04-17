/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from './index';

export type JetpackProductSlug =
	| typeof PRODUCT_JETPACK_BACKUP_DAILY
	| typeof PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY
	| typeof PRODUCT_JETPACK_BACKUP_REALTIME
	| typeof PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
	| typeof PRODUCT_JETPACK_SCAN
	| typeof PRODUCT_JETPACK_SCAN_MONTHLY
	| typeof PRODUCT_JETPACK_SCAN_REALTIME
	| typeof PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY
	| typeof PRODUCT_JETPACK_SEARCH
	| typeof PRODUCT_JETPACK_SEARCH_MONTHLY
	| typeof PRODUCT_JETPACK_ANTI_SPAM
	| typeof PRODUCT_JETPACK_ANTI_SPAM_MONTHLY;

export type WPComProductSlug = typeof PRODUCT_WPCOM_SEARCH | typeof PRODUCT_WPCOM_SEARCH_MONTHLY;

export type ProductSlug = JetpackProductSlug | WPComProductSlug;

export type ProductTranslations = {
	title: TranslateResult;
	description: TranslateResult;
	forceRadios?: boolean;
	hasPromo: boolean;
	id: ProductSlug;
	link: {
		label: TranslateResult;
		props: {
			location: string;
			slug: string;
		};
		url: string;
	};
	slugs: ProductSlug[];
	options: {
		yearly: ProductSlug[];
		monthly: ProductSlug[];
	};
	optionShortNames: () => Record< ProductSlug, TranslateResult >;
	optionActionButtonNames?: () => Record< ProductSlug, TranslateResult >;
	optionDisplayNames: () => Record< ProductSlug, TranslateResult >;
	optionDescriptions: () => Record< ProductSlug, TranslateResult >;
	optionShortNamesCallback?: ( arg0: Record< string, unknown > ) => TranslateResult;
	optionsLabelCallback?: ( arg0: Record< string, unknown > ) => TranslateResult;
	optionsLabel: TranslateResult;
};
