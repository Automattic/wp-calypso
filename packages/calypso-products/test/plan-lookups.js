import config from '@automattic/calypso-config';
import {
	FEATURE_ACTIVITY_LOG,
	FEATURE_ALL_PERSONAL_FEATURES,
	FEATURE_AUDIO_UPLOADS,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
	FEATURE_VIDEO_UPLOADS,
	GROUP_JETPACK,
	GROUP_WPCOM,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_STARTER_YEARLY,
	PLAN_JETPACK_STARTER_MONTHLY,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_GOLDEN_TOKEN,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_PRO_MONTHLY,
	PLAN_WPCOM_STARTER,
	PLAN_100_YEARS,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	TERM_CENTENNIALLY,
	TERM_MONTHLY,
	TYPE_BUSINESS,
	TYPE_PERSONAL,
	TYPE_BLOGGER,
	TYPE_PREMIUM,
	TYPE_FREE,
	PLAN_P2_PLUS,
	PLAN_P2_FREE,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_WOOEXPRESS_PLUS,
	PLAN_WPCOM_PRO_2_YEARS,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	TYPE_100_YEAR,
	PLAN_HOSTING_TRIAL_MONTHLY,
	GROUP_P2,
} from '../src/constants';
import {
	getPlan,
	getPlans,
	getPlanClass,
	isProPlan,
	isBusinessPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBloggerPlan,
	isFreePlan,
	isFlexiblePlan,
	isJetpackBusinessPlan,
	isJetpackPersonalPlan,
	isJetpackPremiumPlan,
	isJetpackFreePlan,
	isWpComProPlan,
	isWpComEcommercePlan,
	isWpComBusinessPlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
	isWpComBloggerPlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isWpComAnnualPlan,
	isWpComBiennialPlan,
	isWpComTriennialPlan,
	isWpComMonthlyPlan,
	planMatches,
	findSimilarPlansKeys,
	findPlansKeys,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	planHasFeature,
	planHasAtLeastOneFeature,
	planHasSuperiorFeature,
	isWooExpressPlan,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
	isWooExpressPlusPlan,
} from '../src/index';

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn( () => true );

	return mock;
} );

describe( 'isFreePlan', () => {
	test( 'should return true for free plans', () => {
		expect( isFreePlan( PLAN_FREE ) ).toEqual( true );
		expect( isFreePlan( PLAN_JETPACK_FREE ) ).toEqual( true );
	} );
	test( 'should return false for non-free plans', () => {
		expect( isFreePlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isFreePlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isFreePlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isFreePlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isFreePlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isFreePlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isFreePlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isFreePlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isFlexiblePlan', () => {
	test( 'should return true for flexible plans', () => {
		expect( isFlexiblePlan( PLAN_WPCOM_FLEXIBLE ) ).toEqual( true );
	} );
	test( 'should return false for non-flexible plans', () => {
		expect( isFlexiblePlan( PLAN_FREE ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_JETPACK_FREE ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_WPCOM_PRO ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_WPCOM_STARTER ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isFlexiblePlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isFlexiblePlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isBloggerPlan', () => {
	test( 'should return true for blogger plans', () => {
		expect( isBloggerPlan( PLAN_BLOGGER ) ).toEqual( true );
		expect( isBloggerPlan( PLAN_BLOGGER_2_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-blogger plans', () => {
		expect( isBloggerPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isBloggerPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isBloggerPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isBloggerPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isBloggerPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isBloggerPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isBloggerPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isBloggerPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isPersonalPlan', () => {
	test( 'should return true for personal plans', () => {
		expect( isPersonalPlan( PLAN_PERSONAL ) ).toEqual( true );
		expect( isPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( true );
		expect( isPersonalPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( true );
		expect( isPersonalPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( true );
		expect( isPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non-personal plans', () => {
		expect( isPersonalPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isPersonalPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isPersonalPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isPersonalPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isPersonalPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isPersonalPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isPremiumPlan', () => {
	test( 'should return true for premium plans', () => {
		expect( isPremiumPlan( PLAN_PREMIUM ) ).toEqual( true );
		expect( isPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( true );
		expect( isPremiumPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( true );
		expect( isPremiumPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( true );
		expect( isPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non-premium plans', () => {
		expect( isPremiumPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isPremiumPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isPremiumPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWooExpressPlan', () => {
	test( 'should return true for Woo Express plans', () => {
		expect( isWooExpressPlan( PLAN_WOOEXPRESS_MEDIUM ) ).toEqual( true );
		expect( isWooExpressPlan( PLAN_WOOEXPRESS_MEDIUM_MONTHLY ) ).toEqual( true );
		expect( isWooExpressPlan( PLAN_WOOEXPRESS_SMALL ) ).toEqual( true );
		expect( isWooExpressPlan( PLAN_WOOEXPRESS_SMALL_MONTHLY ) ).toEqual( true );
		expect( isWooExpressPlan( PLAN_WOOEXPRESS_PLUS ) ).toEqual( true );
	} );
	test( 'should return false for non Woo Express plans', () => {
		expect( isWooExpressPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWooExpressPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWooExpressPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWooExpressMediumPlan', () => {
	test( 'should return true for Woo Express Medium plans', () => {
		expect( isWooExpressMediumPlan( PLAN_WOOEXPRESS_MEDIUM ) ).toEqual( true );
		expect( isWooExpressMediumPlan( PLAN_WOOEXPRESS_MEDIUM_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non Woo Express Medium plans', () => {
		expect( isWooExpressMediumPlan( PLAN_WOOEXPRESS_SMALL ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_WOOEXPRESS_SMALL_MONTHLY ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_WOOEXPRESS_PLUS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWooExpressMediumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWooExpressMediumPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWooExpressSmallPlan', () => {
	test( 'should return true for Woo Express Small plans', () => {
		expect( isWooExpressSmallPlan( PLAN_WOOEXPRESS_SMALL ) ).toEqual( true );
		expect( isWooExpressSmallPlan( PLAN_WOOEXPRESS_SMALL_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non Woo Express Small plans', () => {
		expect( isWooExpressSmallPlan( PLAN_WOOEXPRESS_MEDIUM ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_WOOEXPRESS_MEDIUM_MONTHLY ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_WOOEXPRESS_PLUS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWooExpressSmallPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWooExpressSmallPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWooExpressPlusPlan', () => {
	test( 'should return true for Woo Express Plus plans', () => {
		expect( isWooExpressPlusPlan( PLAN_WOOEXPRESS_PLUS ) ).toEqual( true );
	} );
	test( 'should return false for non Woo Express Plus plans', () => {
		expect( isWooExpressPlusPlan( PLAN_WOOEXPRESS_SMALL ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_WOOEXPRESS_SMALL_MONTHLY ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_WOOEXPRESS_MEDIUM ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_WOOEXPRESS_MEDIUM_MONTHLY ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWooExpressPlusPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWooExpressPlusPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isBusinessPlan', () => {
	test( 'should return true for business plans', () => {
		expect( isBusinessPlan( PLAN_BUSINESS ) ).toEqual( true );
		expect( isBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( true );
		expect( isBusinessPlan( PLAN_BUSINESS_3_YEARS ) ).toEqual( true );
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( true );
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isBusinessPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isBusinessPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isBusinessPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isProPlan', () => {
	test( 'should return true for the Pro plan', () => {
		expect( isProPlan( PLAN_WPCOM_PRO ) ).toEqual( true );
	} );
	test( 'should return false for non-pro plans', () => {
		expect( isProPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isProPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isProPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isProPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isProPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isProPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isProPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isProPlan( PLAN_WPCOM_STARTER ) ).toEqual( false );
		expect( isProPlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComFreePlan', () => {
	test( 'should return true for free plans', () => {
		expect( isWpComFreePlan( PLAN_FREE ) ).toEqual( true );
	} );
	test( 'should return false for non-free plans', () => {
		expect( isWpComFreePlan( PLAN_JETPACK_FREE ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComFreePlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComFreePlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComPersonalPlan', () => {
	test( 'should return true for personal plans', () => {
		expect( isWpComPersonalPlan( PLAN_PERSONAL ) ).toEqual( true );
		expect( isWpComPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( true );
		expect( isWpComPersonalPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-personal plans', () => {
		expect( isWpComPersonalPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComPersonalPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComPersonalPlan( 'non-exisWpComting plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComBloggerPlan', () => {
	test( 'should return true for blogger plans', () => {
		expect( isWpComBloggerPlan( PLAN_BLOGGER ) ).toEqual( true );
		expect( isWpComBloggerPlan( PLAN_BLOGGER_2_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-blogger plans', () => {
		expect( isWpComBloggerPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComBloggerPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWpComBloggerPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComBloggerPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWpComBloggerPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComBloggerPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComBloggerPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComBloggerPlan( 'non-exisWpComting plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComPremiumPlan', () => {
	test( 'should return true for premium plans', () => {
		expect( isWpComPremiumPlan( PLAN_PREMIUM ) ).toEqual( true );
		expect( isWpComPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( true );
		expect( isWpComPremiumPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-premium plans', () => {
		expect( isWpComPremiumPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComPremiumPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComFreePlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComBusinessPlan', () => {
	test( 'should return true for business plans', () => {
		expect( isWpComBusinessPlan( PLAN_BUSINESS ) ).toEqual( true );
		expect( isWpComBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( true );
		expect( isWpComBusinessPlan( PLAN_BUSINESS_3_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isWpComBusinessPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComBusinessPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComBusinessPlan( 'non-exisWpComting plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComEcommercePlan', () => {
	test( 'should return true for eCommerc plans', () => {
		expect( isWpComEcommercePlan( PLAN_ECOMMERCE ) ).toEqual( true );
		expect( isWpComEcommercePlan( PLAN_ECOMMERCE_2_YEARS ) ).toEqual( true );
		expect( isWpComEcommercePlan( PLAN_ECOMMERCE_3_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isWpComEcommercePlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( false );
		expect( isWpComEcommercePlan( PLAN_BUSINESS_3_YEARS ) ).toEqual( false );
		expect( isWpComEcommercePlan( 'non-exisWpComting plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComEnterpriseGridPlan', () => {
	test( 'should return true for enterprise grid plan', () => {
		expect( isWpcomEnterpriseGridPlan( PLAN_ENTERPRISE_GRID_WPCOM ) ).toEqual( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isWpcomEnterpriseGridPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpcomEnterpriseGridPlan( 'non-exisWpComting plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComProPlan', () => {
	test( 'should return true for the Pro plan', () => {
		expect( isWpComProPlan( PLAN_WPCOM_PRO ) ).toEqual( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isWpComProPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( false );
		expect( isWpComProPlan( PLAN_WPCOM_STARTER ) ).toEqual( false );
		expect( isWpComProPlan( 'non-exisWpComting plan' ) ).toEqual( false );
	} );
} );

describe( 'isWpComAnnualPlan', () => {
	test( 'should return true for annual plans', () => {
		expect( isWpComAnnualPlan( PLAN_WPCOM_PRO ) ).toEqual( true );
		expect( isWpComAnnualPlan( PLAN_WPCOM_STARTER ) ).toEqual( true );
		expect( isWpComAnnualPlan( PLAN_PERSONAL ) ).toEqual( true );
		expect( isWpComAnnualPlan( PLAN_PREMIUM ) ).toEqual( true );
		expect( isWpComAnnualPlan( PLAN_BUSINESS ) ).toEqual( true );
		expect( isWpComAnnualPlan( PLAN_ECOMMERCE ) ).toEqual( true );

		// the Free plan is considered annual even though it costs nothing
		expect( isWpComAnnualPlan( PLAN_FREE ) ).toEqual( true );
	} );

	test( 'should return false for non-annual plans', () => {
		expect( isWpComAnnualPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_ECOMMERCE_2_YEARS ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpComAnnualPlan( PLAN_ECOMMERCE_MONTHLY ) ).toEqual( false );
	} );

	test( 'should return false for non-wpcom plans', () => {
		expect( isWpComAnnualPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
	} );
} );

describe( 'isWpComBiennialPlan', () => {
	test( 'should return true for biennial plans', () => {
		expect( isWpComBiennialPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( true );
		expect( isWpComBiennialPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( true );
		expect( isWpComBiennialPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( true );
		expect( isWpComBiennialPlan( PLAN_ECOMMERCE_2_YEARS ) ).toEqual( true );
	} );

	test( 'should return false for non-biennial plans', () => {
		expect( isWpComBiennialPlan( PLAN_WPCOM_PRO ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_WPCOM_STARTER ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_ECOMMERCE_MONTHLY ) ).toEqual( false );
		expect( isWpComBiennialPlan( PLAN_FREE ) ).toEqual( false );
	} );

	test( 'should return false for non-wpcom plans', () => {
		expect( isWpComBiennialPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
	} );
} );

describe( 'isWpComTriennialPlan', () => {
	test( 'should return true for triennial plans', () => {
		expect( isWpComTriennialPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( true );
		expect( isWpComTriennialPlan( PLAN_PREMIUM_3_YEARS ) ).toEqual( true );
		expect( isWpComTriennialPlan( PLAN_BUSINESS_3_YEARS ) ).toEqual( true );
		expect( isWpComTriennialPlan( PLAN_ECOMMERCE_3_YEARS ) ).toEqual( true );
	} );
	test( 'should return false for non-triennial plans', () => {
		expect( isWpComTriennialPlan( PLAN_WPCOM_PRO ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_WPCOM_STARTER ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_BUSINESS_MONTHLY ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_ECOMMERCE_MONTHLY ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_ECOMMERCE_2_YEARS ) ).toEqual( false );
		expect( isWpComTriennialPlan( PLAN_FREE ) ).toEqual( false );
	} );
} );

describe( 'isWpComMonthlyPlan', () => {
	test( 'should return true for monthly plans', () => {
		expect( isWpComMonthlyPlan( PLAN_PERSONAL_MONTHLY ) ).toEqual( true );
		expect( isWpComMonthlyPlan( PLAN_PREMIUM_MONTHLY ) ).toEqual( true );
		expect( isWpComMonthlyPlan( PLAN_BUSINESS_MONTHLY ) ).toEqual( true );
		expect( isWpComMonthlyPlan( PLAN_ECOMMERCE_MONTHLY ) ).toEqual( true );
	} );

	test( 'should return false for non-monthly plans', () => {
		expect( isWpComMonthlyPlan( PLAN_WPCOM_PRO ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_WPCOM_STARTER ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_FREE ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_PERSONAL_3_YEARS ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( false );
		expect( isWpComMonthlyPlan( PLAN_ECOMMERCE_2_YEARS ) ).toEqual( false );
	} );

	test( 'should return false for non-wpcom plans', () => {
		expect( isWpComMonthlyPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
	} );
} );

describe( 'isJetpackFreePlan', () => {
	test( 'should return true for free plans', () => {
		expect( isJetpackFreePlan( PLAN_JETPACK_FREE ) ).toEqual( true );
	} );
	test( 'should return false for non-free plans', () => {
		expect( isJetpackFreePlan( PLAN_FREE ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isJetpackFreePlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isJetpackFreePlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isJetpackPersonalPlan', () => {
	test( 'should return true for personal plans', () => {
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( true );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non-personal plans', () => {
		expect( isJetpackPersonalPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isJetpackPersonalPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isJetpackPersonalPlan( 'non-exisJetpackting plan' ) ).toEqual( false );
	} );
} );

describe( 'isJetpackPremiumPlan', () => {
	test( 'should return true for premium plans', () => {
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( true );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non-premium plans', () => {
		expect( isJetpackPremiumPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( false );
		expect( isJetpackPremiumPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isJetpackFreePlan( 'non-existing plan' ) ).toEqual( false );
	} );
} );

describe( 'isJetpackBusinessPlan', () => {
	test( 'should return true for business plans', () => {
		expect( isJetpackBusinessPlan( PLAN_JETPACK_BUSINESS ) ).toEqual( true );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isJetpackBusinessPlan( PLAN_BUSINESS ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_PERSONAL ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_PERSONAL ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_PREMIUM ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_PREMIUM ) ).toEqual( false );
		expect( isJetpackBusinessPlan( PLAN_ECOMMERCE ) ).toEqual( false );
		expect( isJetpackBusinessPlan( 'non-exisJetpackting plan' ) ).toEqual( false );
	} );
} );

describe( 'getMonthlyPlanByYearly', () => {
	test( 'should return a proper plan', () => {
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_PERSONAL ) ).toEqual(
			PLAN_JETPACK_PERSONAL_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_PREMIUM ) ).toEqual(
			PLAN_JETPACK_PREMIUM_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_BUSINESS ) ).toEqual(
			PLAN_JETPACK_BUSINESS_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_FREE ) ).toEqual( '' );
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_SECURITY_DAILY ) ).toEqual(
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_SECURITY_REALTIME ) ).toEqual(
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_COMPLETE ) ).toEqual(
			PLAN_JETPACK_COMPLETE_MONTHLY
		);
		expect( getYearlyPlanByMonthly( 'unknown_plan' ) ).toEqual( '' );
	} );
} );

describe( 'getYearlyPlanByMonthly', () => {
	test( 'should return a proper plan', () => {
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual(
			PLAN_JETPACK_PERSONAL
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual(
			PLAN_JETPACK_PREMIUM
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual(
			PLAN_JETPACK_BUSINESS
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_SECURITY_DAILY_MONTHLY ) ).toEqual(
			PLAN_JETPACK_SECURITY_DAILY
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ) ).toEqual(
			PLAN_JETPACK_SECURITY_REALTIME
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_COMPLETE_MONTHLY ) ).toEqual(
			PLAN_JETPACK_COMPLETE
		);
		expect( getYearlyPlanByMonthly( 'unknown_plan' ) ).toEqual( '' );
	} );
} );

describe( 'getPlanClass', () => {
	test( 'should return a proper class', () => {
		expect( getPlanClass( PLAN_FREE ) ).toEqual( 'is-free-plan' );
		expect( getPlanClass( PLAN_JETPACK_FREE ) ).toEqual( 'is-free-plan' );
		expect( getPlanClass( PLAN_BLOGGER ) ).toEqual( 'is-blogger-plan' );
		expect( getPlanClass( PLAN_BLOGGER_2_YEARS ) ).toEqual( 'is-blogger-plan' );
		expect( getPlanClass( PLAN_PERSONAL ) ).toEqual( 'is-personal-plan' );
		expect( getPlanClass( PLAN_PERSONAL_2_YEARS ) ).toEqual( 'is-personal-plan' );
		expect( getPlanClass( PLAN_JETPACK_PERSONAL ) ).toEqual( 'is-personal-plan' );
		expect( getPlanClass( PLAN_JETPACK_PERSONAL_MONTHLY ) ).toEqual( 'is-personal-plan' );
		expect( getPlanClass( PLAN_PREMIUM ) ).toEqual( 'is-premium-plan' );
		expect( getPlanClass( PLAN_PREMIUM_2_YEARS ) ).toEqual( 'is-premium-plan' );
		expect( getPlanClass( PLAN_JETPACK_PREMIUM ) ).toEqual( 'is-premium-plan' );
		expect( getPlanClass( PLAN_JETPACK_PREMIUM_MONTHLY ) ).toEqual( 'is-premium-plan' );
		expect( getPlanClass( PLAN_BUSINESS ) ).toEqual( 'is-business-plan' );
		expect( getPlanClass( PLAN_BUSINESS_2_YEARS ) ).toEqual( 'is-business-plan' );
		expect( getPlanClass( PLAN_ECOMMERCE ) ).toEqual( 'is-ecommerce-plan' );
		expect( getPlanClass( PLAN_ECOMMERCE_2_YEARS ) ).toEqual( 'is-ecommerce-plan' );
		expect( getPlanClass( PLAN_ENTERPRISE_GRID_WPCOM ) ).toEqual( 'is-wpcom-enterprise-grid-plan' );
		expect( getPlanClass( PLAN_JETPACK_BUSINESS ) ).toEqual( 'is-business-plan' );
		expect( getPlanClass( PLAN_JETPACK_BUSINESS_MONTHLY ) ).toEqual( 'is-business-plan' );
	} );
} );

describe( 'getPlan', () => {
	test( 'should return a proper plan - by key', () => {
		const plansList = getPlans();
		expect( getPlan( PLAN_PERSONAL ) ).toEqual( plansList[ PLAN_PERSONAL ] );
	} );

	test( 'should return a proper plan - by value', () => {
		const plansList = getPlans();
		expect( getPlan( plansList[ PLAN_PERSONAL ] ) ).toEqual( plansList[ PLAN_PERSONAL ] );
	} );

	test( 'should return undefined for invalid plan - by key', () => {
		expect( getPlan( 'test' ) ).toEqual( undefined );
	} );

	test( 'should return undefined for invalid plan - by value', () => {
		expect( getPlan( {} ) ).toEqual( undefined );
	} );
} );

describe( 'findSimilarPlansKeys', () => {
	test( 'should return a proper similar plan - by term', () => {
		expect( findSimilarPlansKeys( PLAN_BLOGGER, { term: TERM_BIENNIALLY } ) ).toEqual( [
			PLAN_BLOGGER_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_PERSONAL, { term: TERM_BIENNIALLY } ) ).toEqual( [
			PLAN_PERSONAL_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_PREMIUM, { term: TERM_BIENNIALLY } ) ).toEqual( [
			PLAN_PREMIUM_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_BUSINESS, { term: TERM_BIENNIALLY } ) ).toEqual( [
			PLAN_BUSINESS_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_ECOMMERCE, { term: TERM_BIENNIALLY } ) ).toEqual( [
			PLAN_ECOMMERCE_2_YEARS,
		] );

		expect( findSimilarPlansKeys( PLAN_PERSONAL, { term: TERM_TRIENNIALLY } ) ).toEqual( [
			PLAN_PERSONAL_3_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_PREMIUM, { term: TERM_TRIENNIALLY } ) ).toEqual( [
			PLAN_PREMIUM_3_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_BUSINESS, { term: TERM_TRIENNIALLY } ) ).toEqual( [
			PLAN_BUSINESS_3_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_ECOMMERCE, { term: TERM_TRIENNIALLY } ) ).toEqual( [
			PLAN_ECOMMERCE_3_YEARS,
		] );

		expect( findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_PREMIUM,
		] );
		expect( findSimilarPlansKeys( PLAN_BLOGGER_2_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_BLOGGER,
		] );
		expect( findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_PERSONAL,
		] );
		expect( findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_BUSINESS,
		] );

		expect( findSimilarPlansKeys( PLAN_PREMIUM_3_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_PREMIUM,
		] );
		expect( findSimilarPlansKeys( PLAN_ECOMMERCE_3_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_ECOMMERCE,
		] );
		expect( findSimilarPlansKeys( PLAN_WOOEXPRESS_SMALL, { term: TERM_MONTHLY } ) ).toEqual( [
			PLAN_WOOEXPRESS_SMALL_MONTHLY,
		] );
		expect( findSimilarPlansKeys( PLAN_WOOEXPRESS_MEDIUM, { term: TERM_MONTHLY } ) ).toEqual( [
			PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
		] );
		expect( findSimilarPlansKeys( PLAN_PERSONAL_3_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_PERSONAL,
		] );
		expect( findSimilarPlansKeys( PLAN_BUSINESS_3_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_BUSINESS,
		] );

		expect( findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { term: TERM_MONTHLY } ) ).toEqual( [
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { term: TERM_BIENNIALLY } ) ).toEqual(
			[]
		);
		expect( findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { term: TERM_MONTHLY } ) ).toEqual( [
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { term: TERM_BIENNIALLY } ) ).toEqual( [] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { term: TERM_MONTHLY } ) ).toEqual( [
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { term: TERM_BIENNIALLY } ) ).toEqual(
			[]
		);

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_ANNUALLY } )
		).toEqual( [ PLAN_JETPACK_PERSONAL ] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_PREMIUM_MONTHLY, { term: TERM_ANNUALLY } ) ).toEqual(
			[ PLAN_JETPACK_PREMIUM ]
		);
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_ANNUALLY } )
		).toEqual( [ PLAN_JETPACK_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_BIENNIALLY } )
		).toEqual( [] );
	} );

	test( 'should return a proper similar plan - by type and group - wp.com', () => {
		expect(
			findSimilarPlansKeys( PLAN_BLOGGER, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_BLOGGER, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_PERSONAL, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_PERSONAL, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_PREMIUM, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_PREMIUM, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_BUSINESS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM_2_YEARS ] );

		expect(
			findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PERSONAL_2_YEARS ] );

		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PERSONAL_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { type: TYPE_FREE, group: GROUP_WPCOM } )
		).toEqual( [] );
	} );

	test( 'should return a proper similar plan - by type and group - jetpack', () => {
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS, group: GROUP_JETPACK } )
		).toEqual( [ PLAN_JETPACK_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_PREMIUM, group: GROUP_JETPACK } )
		).toEqual( [ PLAN_JETPACK_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_BUSINESS, group: GROUP_JETPACK } )
		).toEqual( [ PLAN_JETPACK_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_PERSONAL, group: GROUP_JETPACK } )
		).toEqual( [ PLAN_JETPACK_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PREMIUM, group: GROUP_JETPACK } )
		).toEqual( [ PLAN_JETPACK_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL, group: GROUP_JETPACK } )
		).toEqual( [ PLAN_JETPACK_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, {
				type: TYPE_BUSINESS,
				group: GROUP_JETPACK,
			} )
		).toEqual( [ PLAN_JETPACK_BUSINESS_MONTHLY ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, {
				type: TYPE_PREMIUM,
				group: GROUP_JETPACK,
			} )
		).toEqual( [ PLAN_JETPACK_PREMIUM_MONTHLY ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM_MONTHLY, {
				type: TYPE_BUSINESS,
				group: GROUP_JETPACK,
			} )
		).toEqual( [ PLAN_JETPACK_BUSINESS_MONTHLY ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM_MONTHLY, {
				type: TYPE_PERSONAL,
				group: GROUP_JETPACK,
			} )
		).toEqual( [ PLAN_JETPACK_PERSONAL_MONTHLY ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, {
				type: TYPE_PREMIUM,
				group: GROUP_JETPACK,
			} )
		).toEqual( [ PLAN_JETPACK_PREMIUM_MONTHLY ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, {
				type: TYPE_PERSONAL,
				group: GROUP_JETPACK,
			} )
		).toEqual( [ PLAN_JETPACK_PERSONAL_MONTHLY ] );
	} );

	test( 'should return a proper similar plan - by type and group - wp.com / jetpack', () => {
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).toEqual( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, {
				type: TYPE_BUSINESS,
				group: GROUP_WPCOM,
			} )
		).toEqual( [
			PLAN_BUSINESS_MONTHLY,
			PLAN_MIGRATION_TRIAL_MONTHLY,
			PLAN_HOSTING_TRIAL_MONTHLY,
		] );
	} );
} );

describe( 'findPlansKeys', () => {
	beforeEach( () => {
		// Enable migration trials mock
		config.isEnabled.mockImplementation( ( key ) => key === 'plans/migration-trial' );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	test( 'all matching plans keys - by term', () => {
		expect( findPlansKeys( { term: TERM_BIENNIALLY } ) ).toEqual( [
			PLAN_BLOGGER_2_YEARS,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE_2_YEARS,
			PLAN_JETPACK_COMPLETE_BI_YEARLY,
			PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
			PLAN_WPCOM_PRO_2_YEARS,
		] );
		expect( findPlansKeys( { term: TERM_TRIENNIALLY } ) ).toEqual( [
			PLAN_PERSONAL_3_YEARS,
			PLAN_PREMIUM_3_YEARS,
			PLAN_BUSINESS_3_YEARS,
			PLAN_ECOMMERCE_3_YEARS,
		] );
		expect( findPlansKeys( { term: TERM_ANNUALLY } ) ).toEqual( [
			PLAN_FREE,
			PLAN_BLOGGER,
			PLAN_PERSONAL,
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_ECOMMERCE,
			PLAN_WOOEXPRESS_MEDIUM,
			PLAN_WOOEXPRESS_SMALL,
			PLAN_WOOEXPRESS_PLUS,
			PLAN_ENTERPRISE_GRID_WPCOM,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
			PLAN_JETPACK_STARTER_YEARLY,
			PLAN_JETPACK_GOLDEN_TOKEN,
			PLAN_P2_FREE,
			PLAN_WPCOM_STARTER,
			PLAN_WPCOM_FLEXIBLE,
			PLAN_WPCOM_PRO,
		] );

		const termMonthlyPaid = [
			PLAN_PERSONAL_MONTHLY,
			PLAN_PREMIUM_MONTHLY,
			PLAN_BUSINESS_MONTHLY,
			PLAN_ECOMMERCE_MONTHLY,
			PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
			PLAN_WOOEXPRESS_SMALL_MONTHLY,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_COMPLETE_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
			PLAN_JETPACK_STARTER_MONTHLY,
			PLAN_P2_PLUS,
			PLAN_WPCOM_PRO_MONTHLY,
			PLAN_ECOMMERCE_TRIAL_MONTHLY,
			PLAN_MIGRATION_TRIAL_MONTHLY,
			PLAN_HOSTING_TRIAL_MONTHLY,
		];

		expect( findPlansKeys( { term: TERM_CENTENNIALLY } ) ).toEqual( [ PLAN_100_YEARS ] );

		expect( findPlansKeys( { term: TERM_MONTHLY } ) ).toEqual( termMonthlyPaid );
	} );

	test( 'all matching plans keys - by type', () => {
		expect( findPlansKeys( { type: TYPE_FREE } ) ).toEqual( [
			PLAN_FREE,
			PLAN_JETPACK_FREE,
			PLAN_P2_FREE,
		] );
		expect( findPlansKeys( { type: TYPE_BLOGGER } ) ).toEqual( [
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
		] );
		expect( findPlansKeys( { type: TYPE_PERSONAL } ) ).toEqual( [
			PLAN_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PERSONAL_3_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect( findPlansKeys( { type: TYPE_PREMIUM } ) ).toEqual( [
			PLAN_PREMIUM_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PREMIUM_3_YEARS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findPlansKeys( { type: TYPE_BUSINESS } ) ).toEqual( [
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_BUSINESS_3_YEARS,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_MIGRATION_TRIAL_MONTHLY,
			PLAN_HOSTING_TRIAL_MONTHLY,
		] );

		expect( findPlansKeys( { type: TYPE_100_YEAR } ) ).toEqual( [ PLAN_100_YEARS ] );
	} );

	test( 'all matching plans keys - by group', () => {
		expect( findPlansKeys( { group: GROUP_WPCOM } ) ).toEqual( [
			PLAN_FREE,
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
			PLAN_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PERSONAL_3_YEARS,
			PLAN_PREMIUM_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PREMIUM_3_YEARS,
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_BUSINESS_3_YEARS,
			PLAN_100_YEARS,
			PLAN_ECOMMERCE_MONTHLY,
			PLAN_ECOMMERCE,
			PLAN_ECOMMERCE_2_YEARS,
			PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
			PLAN_WOOEXPRESS_MEDIUM,
			PLAN_WOOEXPRESS_SMALL_MONTHLY,
			PLAN_WOOEXPRESS_SMALL,
			PLAN_WOOEXPRESS_PLUS,
			PLAN_ENTERPRISE_GRID_WPCOM,
			PLAN_ECOMMERCE_3_YEARS,
			PLAN_WPCOM_STARTER,
			PLAN_WPCOM_FLEXIBLE,
			PLAN_WPCOM_PRO,
			PLAN_WPCOM_PRO_MONTHLY,
			PLAN_WPCOM_PRO_2_YEARS,
			PLAN_ECOMMERCE_TRIAL_MONTHLY,
			PLAN_MIGRATION_TRIAL_MONTHLY,
			PLAN_HOSTING_TRIAL_MONTHLY,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK } ) ).toEqual( [
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_COMPLETE_BI_YEARLY,
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_COMPLETE_MONTHLY,
			PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
			PLAN_JETPACK_STARTER_YEARLY,
			PLAN_JETPACK_STARTER_MONTHLY,
			PLAN_JETPACK_GOLDEN_TOKEN,
		] );
		expect( findPlansKeys( { group: GROUP_P2 } ) ).toEqual( [ PLAN_P2_PLUS, PLAN_P2_FREE ] );
	} );
	test( 'all matching plans keys - by group and type', () => {
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BLOGGER } ) ).toEqual( [
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PERSONAL } ) ).toEqual( [
			PLAN_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PERSONAL_3_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PREMIUM } ) ).toEqual( [
			PLAN_PREMIUM_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PREMIUM_3_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BUSINESS } ) ).toEqual( [
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_BUSINESS_3_YEARS,
			PLAN_MIGRATION_TRIAL_MONTHLY,
			PLAN_HOSTING_TRIAL_MONTHLY,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_BLOGGER } ) ).toEqual( [] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PERSONAL } ) ).toEqual( [
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PREMIUM } ) ).toEqual( [
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_BUSINESS } ) ).toEqual( [
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );
} );

describe( 'planMatches - general', () => {
	test( 'should throw an error if called with unknown query parameter', () => {
		expect( () => planMatches( PLAN_PERSONAL, { test: 123 } ) ).toThrow();
	} );
} );

describe( 'planMatches - personal', () => {
	test( 'should return true for matching queries', () => {
		expect( planMatches( PLAN_PERSONAL, { type: TYPE_PERSONAL } ) ).toEqual( true );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { type: TYPE_PERSONAL } ) ).toEqual( true );
		expect( planMatches( PLAN_PERSONAL_3_YEARS, { type: TYPE_PERSONAL } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { type: TYPE_PERSONAL } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { type: TYPE_PERSONAL } ) ).toEqual( true );

		expect( planMatches( PLAN_PERSONAL, { group: GROUP_WPCOM } ) ).toEqual( true );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { group: GROUP_WPCOM } ) ).toEqual( true );
		expect( planMatches( PLAN_PERSONAL_3_YEARS, { group: GROUP_WPCOM } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { group: GROUP_JETPACK } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { group: GROUP_JETPACK } ) ).toEqual(
			true
		);

		expect( planMatches( PLAN_PERSONAL, { term: TERM_ANNUALLY } ) ).toEqual( true );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { term: TERM_BIENNIALLY } ) ).toEqual( true );
		expect( planMatches( PLAN_PERSONAL_3_YEARS, { term: TERM_TRIENNIALLY } ) ).toEqual( true );

		expect( planMatches( PLAN_JETPACK_PERSONAL, { term: TERM_ANNUALLY } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_MONTHLY } ) ).toEqual( true );
	} );
	test( 'should return false for non-matching queries', () => {
		expect( planMatches( PLAN_PERSONAL, { type: TYPE_BUSINESS } ) ).toEqual( false );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { type: TYPE_BUSINESS } ) ).toEqual( false );
		expect( planMatches( PLAN_PERSONAL_3_YEARS, { type: TYPE_BUSINESS } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { type: TYPE_BUSINESS } ) ).toEqual(
			false
		);

		expect( planMatches( PLAN_PERSONAL, { group: GROUP_JETPACK } ) ).toEqual( false );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { group: GROUP_JETPACK } ) ).toEqual( false );
		expect( planMatches( PLAN_PERSONAL_3_YEARS, { group: GROUP_JETPACK } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { group: GROUP_WPCOM } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { group: GROUP_WPCOM } ) ).toEqual( false );

		expect( planMatches( PLAN_PERSONAL, { term: TERM_MONTHLY } ) ).toEqual( false );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( false );
		expect( planMatches( PLAN_PERSONAL_3_YEARS, { term: TERM_BIENNIALLY } ) ).toEqual( false );

		expect( planMatches( PLAN_JETPACK_PERSONAL, { term: TERM_MONTHLY } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_ANNUALLY } ) ).toEqual(
			false
		);
	} );
} );

describe( 'planMatches - business', () => {
	test( 'should return true for matching queries', () => {
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS } ) ).toEqual( true );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { type: TYPE_BUSINESS } ) ).toEqual( true );
		expect( planMatches( PLAN_BUSINESS_3_YEARS, { type: TYPE_BUSINESS } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { type: TYPE_BUSINESS } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { type: TYPE_BUSINESS } ) ).toEqual( true );

		expect( planMatches( PLAN_BUSINESS, { group: GROUP_WPCOM } ) ).toEqual( true );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { group: GROUP_WPCOM } ) ).toEqual( true );
		expect( planMatches( PLAN_BUSINESS_3_YEARS, { group: GROUP_WPCOM } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { group: GROUP_JETPACK } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { group: GROUP_JETPACK } ) ).toEqual(
			true
		);

		expect( planMatches( PLAN_BUSINESS, { term: TERM_ANNUALLY } ) ).toEqual( true );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { term: TERM_BIENNIALLY } ) ).toEqual( true );
		expect( planMatches( PLAN_BUSINESS_3_YEARS, { term: TERM_TRIENNIALLY } ) ).toEqual( true );

		expect( planMatches( PLAN_JETPACK_BUSINESS, { term: TERM_ANNUALLY } ) ).toEqual( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_MONTHLY } ) ).toEqual( true );

		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) ).toEqual(
			true
		);
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, term: TERM_ANNUALLY } ) ).toEqual(
			true
		);
		expect(
			planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, group: GROUP_WPCOM, term: TERM_ANNUALLY } )
		).toEqual( true );
	} );
	test( 'should return false for non-matching queries', () => {
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_PERSONAL } ) ).toEqual( false );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { type: TYPE_PERSONAL } ) ).toEqual( false );
		expect( planMatches( PLAN_BUSINESS_3_YEARS, { type: TYPE_PERSONAL } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { type: TYPE_PERSONAL } ) ).toEqual(
			false
		);

		expect( planMatches( PLAN_BUSINESS, { group: GROUP_JETPACK } ) ).toEqual( false );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { group: GROUP_JETPACK } ) ).toEqual( false );
		expect( planMatches( PLAN_BUSINESS_3_YEARS, { group: GROUP_JETPACK } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { group: GROUP_WPCOM } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { group: GROUP_WPCOM } ) ).toEqual( false );

		expect( planMatches( PLAN_BUSINESS, { term: TERM_MONTHLY } ) ).toEqual( false );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { term: TERM_ANNUALLY } ) ).toEqual( false );
		expect( planMatches( PLAN_BUSINESS_3_YEARS, { term: TERM_BIENNIALLY } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { term: TERM_MONTHLY } ) ).toEqual( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_ANNUALLY } ) ).toEqual(
			false
		);
	} );
} );

describe( 'planHasFeature', () => {
	test( 'should return true when a plan has a plan compare feature', () => {
		expect( planHasFeature( PLAN_PERSONAL, FEATURE_CUSTOM_DOMAIN ) ).toBe( true );
	} );

	test( 'should return true when a plan has a sign-up specific feature', () => {
		expect( planHasFeature( PLAN_PREMIUM, FEATURE_ALL_PERSONAL_FEATURES ) ).toBe( true );
	} );

	test( 'should return true when a plan has a hidden feature', () => {
		expect( planHasFeature( PLAN_BUSINESS, FEATURE_AUDIO_UPLOADS ) ).toBe( true );
	} );

	test( 'should return false when a plan does not have a feature', () => {
		expect( planHasFeature( PLAN_PERSONAL, FEATURE_VIDEO_UPLOADS ) ).toBe( false );
	} );
} );

describe( 'planHasAtLeastOneFeature', () => {
	test( 'should return true when a plan has one of the provided features', () => {
		expect(
			planHasAtLeastOneFeature( PLAN_JETPACK_COMPLETE, [
				FEATURE_JETPACK_BACKUP_T2_YEARLY, // Jetpack Complete has realtime backup
				FEATURE_ACTIVITY_LOG, // Activity log is not listed in Jetpack Complete features
			] )
		).toBe( true );
	} );

	test( 'should return false when a plan has none of the provided features', () => {
		expect(
			planHasAtLeastOneFeature( PLAN_JETPACK_SECURITY_T1_YEARLY, [
				FEATURE_JETPACK_BACKUP_T2_YEARLY,
				FEATURE_VIDEO_UPLOADS,
			] )
		).toBe( false );
	} );
} );

describe( 'planHasSuperiorFeature', () => {
	test( 'should return true when a yearly plan has a superior feature', () => {
		expect( planHasSuperiorFeature( PLAN_JETPACK_BUSINESS, FEATURE_JETPACK_BACKUP_DAILY ) ).toBe(
			true
		);
	} );

	test( 'should return true when a monthly plan has a superior feature', () => {
		expect(
			planHasSuperiorFeature( PLAN_JETPACK_BUSINESS_MONTHLY, FEATURE_JETPACK_BACKUP_DAILY )
		).toBe( true );
	} );

	test( 'should return false when a yearly plan does not have a superior feature', () => {
		expect( planHasSuperiorFeature( PLAN_JETPACK_BUSINESS, FEATURE_JETPACK_BACKUP_REALTIME ) ).toBe(
			false
		);
	} );

	test( 'should return false when a monthly plan does not have a superior feature', () => {
		expect(
			planHasSuperiorFeature( PLAN_JETPACK_BUSINESS_MONTHLY, FEATURE_JETPACK_BACKUP_REALTIME )
		).toBe( false );
	} );
} );
