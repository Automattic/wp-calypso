import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
} from '@automattic/calypso-products';

export const COMPARE_PLANS_QUERY_PARAM = 'compare_plans';

// Ref: https://jetpack.com/support/jetpack-plan-equivalency-chart/
export const LEGACY_TO_RECOMMENDED_MAP = {
	[ PLAN_JETPACK_PERSONAL ]: [ PRODUCT_JETPACK_BACKUP_T1_YEARLY, PRODUCT_JETPACK_ANTI_SPAM ],
	[ PLAN_JETPACK_PERSONAL_MONTHLY ]: [
		PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
		PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	],
	[ PLAN_JETPACK_PREMIUM ]: [ PLAN_JETPACK_SECURITY_T1_YEARLY, PRODUCT_JETPACK_VIDEOPRESS ],
	[ PLAN_JETPACK_PREMIUM_MONTHLY ]: [
		PLAN_JETPACK_SECURITY_T1_MONTHLY,
		PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	],
	[ PLAN_JETPACK_BUSINESS ]: [ PLAN_JETPACK_COMPLETE ],
	[ PLAN_JETPACK_BUSINESS_MONTHLY ]: [ PLAN_JETPACK_COMPLETE_MONTHLY ],
};
