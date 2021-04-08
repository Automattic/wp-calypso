/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type * as constants from './constants';

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

export interface CamelCaseProduct {
	productSlug: string;
	productType?: string | undefined;
	includedDomainPurchaseAmount?: number | undefined;
	isDomainRegistration?: boolean | undefined;
}

export interface FormattedProduct {
	product_slug: string;
	product_id?: number | undefined;
	product_name?: string | undefined;
	product_type?: string | undefined;
	included_domain_purchase_amount?: number | undefined;
	is_domain_registration?: boolean | undefined;
	term?: string | undefined;
	bill_period?: number | undefined;
	is_bundled?: boolean | undefined;
}

export type DelayedDomainTransferProduct = ( FormattedProduct | CamelCaseProduct ) & {
	delayedProvisioning?: boolean;
};
