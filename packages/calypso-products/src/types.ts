/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type * as constants from './constants';
import type { TranslateResult } from 'i18n-calypso';

export * from './product-values-types';

export type JetpackResetPlanSlugs =
	| typeof constants.PLAN_JETPACK_SECURITY_DAILY
	| typeof constants.PLAN_JETPACK_SECURITY_DAILY_MONTHLY
	| typeof constants.PLAN_JETPACK_SECURITY_REALTIME
	| typeof constants.PLAN_JETPACK_SECURITY_REALTIME_MONTHLY
	| typeof constants.PLAN_JETPACK_COMPLETE
	| typeof constants.PLAN_JETPACK_COMPLETE_MONTHLY;

export type JetpackLegacyPlanSlugs =
	| typeof constants.PLAN_JETPACK_PERSONAL
	| typeof constants.PLAN_JETPACK_PERSONAL_MONTHLY
	| typeof constants.PLAN_JETPACK_PREMIUM
	| typeof constants.PLAN_JETPACK_PREMIUM_MONTHLY
	| typeof constants.PLAN_JETPACK_BUSINESS
	| typeof constants.PLAN_JETPACK_BUSINESS_MONTHLY;

export type JetpackPlanSlugs =
	| typeof constants.PLAN_JETPACK_FREE
	| JetpackResetPlanSlugs
	| JetpackLegacyPlanSlugs;

export type JetpackPlanCardFeature = symbol | [ symbol, symbol[] ];
export type JetpackPlanCardFeatureSection = Record< symbol, JetpackPlanCardFeature[] >;

export type Plan = {
	group: typeof constants.GROUP_WPCOM | typeof constants.GROUP_JETPACK;
	type: string;
	term:
		| typeof constants.TERM_ANNUALLY
		| typeof constants.TERM_BIENNIALLY
		| typeof constants.TERM_MONTHLY;
	getBillingTimeFrame: () => TranslateResult;
	getTitle: ( variation?: string ) => TranslateResult;
	getDescription: ( variation?: string ) => TranslateResult;
	getTagline?: ( featuresOrCROVariation?: string[] | string ) => TranslateResult;
	getButtonLabel?: ( variation?: string ) => TranslateResult;
	getAnnualSlug?: () => JetpackPlanSlugs | string;
	getMonthlySlug?: () => JetpackPlanSlugs | string;
	getAudience?: () => TranslateResult;
	getBlogAudience?: () => TranslateResult;
	getPortfolioAudience?: () => TranslateResult;
	getStoreAudience?: () => TranslateResult;
	getProductId: () => number;
	getStoreSlug: () => JetpackPlanSlugs | string;
	getPathSlug?: () => string;
	getPlanCompareFeatures?: () => string[];
	getPlanCardFeatures?: (
		variation?: string
	) => JetpackPlanCardFeature[] | JetpackPlanCardFeatureSection;
	getSignupFeatures?: () => string[];
	getBlogSignupFeatures?: () => string[];
	getPortfolioSignupFeatures?: () => string[];
	getHiddenFeatures?: () => string[];
	getInferiorHiddenFeatures?: () => string[];
};

export type JetpackDailyPlan =
	| typeof constants.PLAN_JETPACK_SECURITY_DAILY
	| typeof constants.PLAN_JETPACK_SECURITY_DAILY_MONTHLY;

export type JetpackRealtimePlan =
	| typeof constants.PLAN_JETPACK_SECURITY_REALTIME
	| typeof constants.PLAN_JETPACK_SECURITY_REALTIME_MONTHLY;
