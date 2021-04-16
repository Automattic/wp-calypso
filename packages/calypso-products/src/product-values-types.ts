/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type * as constants from '@automattic/calypso-products';

export type JetpackProductSlug =
	| typeof constants.PRODUCT_JETPACK_BACKUP_DAILY
	| typeof constants.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY
	| typeof constants.PRODUCT_JETPACK_BACKUP_REALTIME
	| typeof constants.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
	| typeof constants.PRODUCT_JETPACK_SCAN
	| typeof constants.PRODUCT_JETPACK_SCAN_MONTHLY
	| typeof constants.PRODUCT_JETPACK_SCAN_REALTIME
	| typeof constants.PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY
	| typeof constants.PRODUCT_JETPACK_SEARCH
	| typeof constants.PRODUCT_JETPACK_SEARCH_MONTHLY
	| typeof constants.PRODUCT_JETPACK_ANTI_SPAM
	| typeof constants.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY;

export type WPComProductSlug =
	| typeof constants.PRODUCT_WPCOM_SEARCH
	| typeof constants.PRODUCT_WPCOM_SEARCH_MONTHLY;

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
