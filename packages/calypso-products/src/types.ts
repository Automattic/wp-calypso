/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type {
	GROUP_JETPACK,
	GROUP_WPCOM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from './plans-constants';

export * from './product-values-types';

export type JetpackResetPlanSlugs =
	| typeof PLAN_JETPACK_SECURITY_DAILY
	| typeof PLAN_JETPACK_SECURITY_DAILY_MONTHLY
	| typeof PLAN_JETPACK_SECURITY_REALTIME
	| typeof PLAN_JETPACK_SECURITY_REALTIME_MONTHLY
	| typeof PLAN_JETPACK_COMPLETE
	| typeof PLAN_JETPACK_COMPLETE_MONTHLY;

export type JetpackLegacyPlanSlugs =
	| typeof PLAN_JETPACK_PERSONAL
	| typeof PLAN_JETPACK_PERSONAL_MONTHLY
	| typeof PLAN_JETPACK_PREMIUM
	| typeof PLAN_JETPACK_PREMIUM_MONTHLY
	| typeof PLAN_JETPACK_BUSINESS
	| typeof PLAN_JETPACK_BUSINESS_MONTHLY;

export type JetpackPlanSlugs =
	| typeof PLAN_JETPACK_FREE
	| JetpackResetPlanSlugs
	| JetpackLegacyPlanSlugs;

export type JetpackPlanCardFeature = symbol | [ symbol, symbol[] ];
export type JetpackPlanCardFeatureSection = Record< symbol, JetpackPlanCardFeature[] >;

export type Plan = {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK;
	type: string;
	term: typeof TERM_ANNUALLY | typeof TERM_BIENNIALLY | typeof TERM_MONTHLY;
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
	| typeof PLAN_JETPACK_SECURITY_DAILY
	| typeof PLAN_JETPACK_SECURITY_DAILY_MONTHLY;

export type JetpackRealtimePlan =
	| typeof PLAN_JETPACK_SECURITY_REALTIME
	| typeof PLAN_JETPACK_SECURITY_REALTIME_MONTHLY;
