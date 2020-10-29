/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	FEATURE_ALL_PERSONAL_FEATURES,
	FEATURE_AUDIO_UPLOADS,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_VIDEO_UPLOADS,
	GROUP_JETPACK,
	GROUP_WPCOM,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
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
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TYPE_BUSINESS,
	TYPE_PERSONAL,
	TYPE_BLOGGER,
	TYPE_PREMIUM,
	TYPE_FREE,
	PLAN_P2_PLUS,
} from '../constants';
import { PLANS_LIST } from '../plans-list';
import {
	getPlan,
	getPlanClass,
	isBusinessPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBloggerPlan,
	isFreePlan,
	isJetpackBusinessPlan,
	isJetpackPersonalPlan,
	isJetpackPremiumPlan,
	isJetpackFreePlan,
	isWpComEcommercePlan,
	isWpComBusinessPlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
	isWpComBloggerPlan,
	isWpComFreePlan,
	planMatches,
	findSimilarPlansKeys,
	findPlansKeys,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	planHasFeature,
	planHasSuperiorFeature,
} from '../index';

describe( 'isFreePlan', () => {
	test( 'should return true for free plans', () => {
		expect( isFreePlan( PLAN_FREE ) ).to.equal( true );
		expect( isFreePlan( PLAN_JETPACK_FREE ) ).to.equal( true );
	} );
	test( 'should return false for non-free plans', () => {
		expect( isFreePlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isFreePlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isFreePlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isFreePlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isFreePlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isFreePlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isFreePlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isFreePlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isBloggerPlan', () => {
	test( 'should return true for blogger plans', () => {
		expect( isBloggerPlan( PLAN_BLOGGER ) ).to.equal( true );
		expect( isBloggerPlan( PLAN_BLOGGER_2_YEARS ) ).to.equal( true );
	} );
	test( 'should return false for non-blogger plans', () => {
		expect( isBloggerPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isBloggerPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( false );
		expect( isBloggerPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isBloggerPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( false );
		expect( isBloggerPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isBloggerPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isBloggerPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isBloggerPlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isPersonalPlan', () => {
	test( 'should return true for personal plans', () => {
		expect( isPersonalPlan( PLAN_PERSONAL ) ).to.equal( true );
		expect( isPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( true );
		expect( isPersonalPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( true );
		expect( isPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( true );
	} );
	test( 'should return false for non-personal plans', () => {
		expect( isPersonalPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( false );
		expect( isPersonalPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( false );
		expect( isPersonalPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isPersonalPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isPersonalPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isPersonalPlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isPremiumPlan', () => {
	test( 'should return true for premium plans', () => {
		expect( isPremiumPlan( PLAN_PREMIUM ) ).to.equal( true );
		expect( isPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( true );
		expect( isPremiumPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( true );
		expect( isPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( true );
	} );
	test( 'should return false for non-premium plans', () => {
		expect( isPremiumPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isPremiumPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isPremiumPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isPremiumPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isPremiumPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isPremiumPlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isBusinessPlan', () => {
	test( 'should return true for business plans', () => {
		expect( isBusinessPlan( PLAN_BUSINESS ) ).to.equal( true );
		expect( isBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).to.equal( true );
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( true );
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.equal( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isBusinessPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isBusinessPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isBusinessPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isBusinessPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isBusinessPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isBusinessPlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isWpComFreePlan', () => {
	test( 'should return true for free plans', () => {
		expect( isWpComFreePlan( PLAN_FREE ) ).to.equal( true );
	} );
	test( 'should return false for non-free plans', () => {
		expect( isWpComFreePlan( PLAN_JETPACK_FREE ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isWpComFreePlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isWpComFreePlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isWpComPersonalPlan', () => {
	test( 'should return true for personal plans', () => {
		expect( isWpComPersonalPlan( PLAN_PERSONAL ) ).to.equal( true );
		expect( isWpComPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( true );
	} );
	test( 'should return false for non-personal plans', () => {
		expect( isWpComPersonalPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isWpComPersonalPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isWpComPersonalPlan( 'non-exisWpComting plan' ) ).to.equal( false );
	} );
} );

describe( 'isWpComBloggerPlan', () => {
	test( 'should return true for blogger plans', () => {
		expect( isWpComBloggerPlan( PLAN_BLOGGER ) ).to.equal( true );
		expect( isWpComBloggerPlan( PLAN_BLOGGER_2_YEARS ) ).to.equal( true );
	} );
	test( 'should return false for non-blogger plans', () => {
		expect( isWpComBloggerPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isWpComBloggerPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( false );
		expect( isWpComBloggerPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isWpComBloggerPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( false );
		expect( isWpComBloggerPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isWpComBloggerPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isWpComBloggerPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isWpComBloggerPlan( 'non-exisWpComting plan' ) ).to.equal( false );
	} );
} );

describe( 'isWpComPremiumPlan', () => {
	test( 'should return true for premium plans', () => {
		expect( isWpComPremiumPlan( PLAN_PREMIUM ) ).to.equal( true );
		expect( isWpComPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( true );
	} );
	test( 'should return false for non-premium plans', () => {
		expect( isWpComPremiumPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isWpComPremiumPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isWpComFreePlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isWpComBusinessPlan', () => {
	test( 'should return true for business plans', () => {
		expect( isWpComBusinessPlan( PLAN_BUSINESS ) ).to.equal( true );
		expect( isWpComBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).to.equal( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isWpComBusinessPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isWpComBusinessPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isWpComBusinessPlan( 'non-exisWpComting plan' ) ).to.equal( false );
	} );
} );

describe( 'isWpComEcommercePlan', () => {
	test( 'should return true for eCommerc plans', () => {
		expect( isWpComEcommercePlan( PLAN_ECOMMERCE ) ).to.equal( true );
		expect( isWpComEcommercePlan( PLAN_ECOMMERCE_2_YEARS ) ).to.equal( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isWpComEcommercePlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isWpComEcommercePlan( PLAN_BUSINESS_2_YEARS ) ).to.equal( false );
		expect( isWpComEcommercePlan( 'non-exisWpComting plan' ) ).to.equal( false );
	} );
} );

describe( 'isJetpackFreePlan', () => {
	test( 'should return true for free plans', () => {
		expect( isJetpackFreePlan( PLAN_JETPACK_FREE ) ).to.equal( true );
	} );
	test( 'should return false for non-free plans', () => {
		expect( isJetpackFreePlan( PLAN_FREE ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isJetpackFreePlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isJetpackFreePlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isJetpackPersonalPlan', () => {
	test( 'should return true for personal plans', () => {
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( true );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( true );
	} );
	test( 'should return false for non-personal plans', () => {
		expect( isJetpackPersonalPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isJetpackPersonalPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isJetpackPersonalPlan( 'non-exisJetpackting plan' ) ).to.equal( false );
	} );
} );

describe( 'isJetpackPremiumPlan', () => {
	test( 'should return true for premium plans', () => {
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( true );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( true );
	} );
	test( 'should return false for non-premium plans', () => {
		expect( isJetpackPremiumPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( false );
		expect( isJetpackPremiumPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isJetpackFreePlan( 'non-existing plan' ) ).to.equal( false );
	} );
} );

describe( 'isJetpackBusinessPlan', () => {
	test( 'should return true for business plans', () => {
		expect( isJetpackBusinessPlan( PLAN_JETPACK_BUSINESS ) ).to.equal( true );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.equal( true );
	} );
	test( 'should return false for non-business plans', () => {
		expect( isJetpackBusinessPlan( PLAN_BUSINESS ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_PERSONAL ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_PERSONAL ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_PREMIUM ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_JETPACK_PREMIUM ) ).to.equal( false );
		expect( isJetpackBusinessPlan( PLAN_ECOMMERCE ) ).to.equal( false );
		expect( isJetpackBusinessPlan( 'non-exisJetpackting plan' ) ).to.equal( false );
	} );
} );

describe( 'getMonthlyPlanByYearly', () => {
	test( 'should return a proper plan', () => {
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_PERSONAL ) ).to.equal(
			PLAN_JETPACK_PERSONAL_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_PREMIUM ) ).to.equal(
			PLAN_JETPACK_PREMIUM_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_BUSINESS ) ).to.equal(
			PLAN_JETPACK_BUSINESS_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_FREE ) ).to.equal( '' );
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_SECURITY_DAILY ) ).to.equal(
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_SECURITY_REALTIME ) ).to.equal(
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY
		);
		expect( getMonthlyPlanByYearly( PLAN_JETPACK_COMPLETE ) ).to.equal(
			PLAN_JETPACK_COMPLETE_MONTHLY
		);
		expect( getYearlyPlanByMonthly( 'unknown_plan' ) ).to.equal( '' );
	} );
} );

describe( 'getYearlyPlanByMonthly', () => {
	test( 'should return a proper plan', () => {
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal(
			PLAN_JETPACK_PERSONAL
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal(
			PLAN_JETPACK_PREMIUM
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.equal(
			PLAN_JETPACK_BUSINESS
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_SECURITY_DAILY_MONTHLY ) ).to.equal(
			PLAN_JETPACK_SECURITY_DAILY
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ) ).to.equal(
			PLAN_JETPACK_SECURITY_REALTIME
		);
		expect( getYearlyPlanByMonthly( PLAN_JETPACK_COMPLETE_MONTHLY ) ).to.equal(
			PLAN_JETPACK_COMPLETE
		);
		expect( getYearlyPlanByMonthly( 'unknown_plan' ) ).to.equal( '' );
	} );
} );

describe( 'getPlanClass', () => {
	test( 'should return a proper class', () => {
		expect( getPlanClass( PLAN_FREE ) ).to.equal( 'is-free-plan' );
		expect( getPlanClass( PLAN_JETPACK_FREE ) ).to.equal( 'is-free-plan' );
		expect( getPlanClass( PLAN_BLOGGER ) ).to.equal( 'is-blogger-plan' );
		expect( getPlanClass( PLAN_BLOGGER_2_YEARS ) ).to.equal( 'is-blogger-plan' );
		expect( getPlanClass( PLAN_PERSONAL ) ).to.equal( 'is-personal-plan' );
		expect( getPlanClass( PLAN_PERSONAL_2_YEARS ) ).to.equal( 'is-personal-plan' );
		expect( getPlanClass( PLAN_JETPACK_PERSONAL ) ).to.equal( 'is-personal-plan' );
		expect( getPlanClass( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.equal( 'is-personal-plan' );
		expect( getPlanClass( PLAN_PREMIUM ) ).to.equal( 'is-premium-plan' );
		expect( getPlanClass( PLAN_PREMIUM_2_YEARS ) ).to.equal( 'is-premium-plan' );
		expect( getPlanClass( PLAN_JETPACK_PREMIUM ) ).to.equal( 'is-premium-plan' );
		expect( getPlanClass( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.equal( 'is-premium-plan' );
		expect( getPlanClass( PLAN_BUSINESS ) ).to.equal( 'is-business-plan' );
		expect( getPlanClass( PLAN_BUSINESS_2_YEARS ) ).to.equal( 'is-business-plan' );
		expect( getPlanClass( PLAN_ECOMMERCE ) ).to.equal( 'is-ecommerce-plan' );
		expect( getPlanClass( PLAN_ECOMMERCE_2_YEARS ) ).to.equal( 'is-ecommerce-plan' );
		expect( getPlanClass( PLAN_JETPACK_BUSINESS ) ).to.equal( 'is-business-plan' );
		expect( getPlanClass( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.equal( 'is-business-plan' );
	} );
} );

describe( 'getPlan', () => {
	test( 'should return a proper plan - by key', () => {
		expect( getPlan( PLAN_PERSONAL ) ).to.equal( PLANS_LIST[ PLAN_PERSONAL ] );
	} );

	test( 'should return a proper plan - by value', () => {
		expect( getPlan( PLANS_LIST[ PLAN_PERSONAL ] ) ).to.equal( PLANS_LIST[ PLAN_PERSONAL ] );
	} );

	test( 'should return undefined for invalid plan - by key', () => {
		expect( getPlan( 'test' ) ).to.equal( undefined );
	} );

	test( 'should return undefined for invalid plan - by value', () => {
		expect( getPlan( {} ) ).to.equal( undefined );
	} );
} );

describe( 'findSimilarPlansKeys', () => {
	test( 'should return a proper similar plan - by term', () => {
		expect( findSimilarPlansKeys( PLAN_BLOGGER, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_BLOGGER_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_PERSONAL, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_PERSONAL_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_PREMIUM, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_PREMIUM_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_BUSINESS, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_BUSINESS_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_ECOMMERCE, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_ECOMMERCE_2_YEARS,
		] );

		expect( findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { term: TERM_ANNUALLY } ) ).to.deep.equal( [
			PLAN_PREMIUM,
		] );
		expect( findSimilarPlansKeys( PLAN_BLOGGER_2_YEARS, { term: TERM_ANNUALLY } ) ).to.deep.equal( [
			PLAN_BLOGGER,
		] );
		expect(
			findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { term: TERM_ANNUALLY } )
		).to.deep.equal( [ PLAN_PERSONAL ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { term: TERM_ANNUALLY } )
		).to.deep.equal( [ PLAN_BUSINESS ] );

		expect( findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { term: TERM_MONTHLY } ) ).to.deep.equal( [
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { term: TERM_BIENNIALLY } )
		).to.deep.equal( [] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { term: TERM_MONTHLY } ) ).to.deep.equal( [
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { term: TERM_BIENNIALLY } ) ).to.deep.equal(
			[]
		);
		expect( findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { term: TERM_MONTHLY } ) ).to.deep.equal( [
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { term: TERM_BIENNIALLY } )
		).to.deep.equal( [] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_ANNUALLY } )
		).to.deep.equal( [ PLAN_JETPACK_PERSONAL ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM_MONTHLY, { term: TERM_ANNUALLY } )
		).to.deep.equal( [ PLAN_JETPACK_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_ANNUALLY } )
		).to.deep.equal( [ PLAN_JETPACK_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_BIENNIALLY } )
		).to.deep.equal( [] );
	} );

	test( 'should return a proper similar plan - by type and group - wp.com', () => {
		expect(
			findSimilarPlansKeys( PLAN_BLOGGER, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_BLOGGER, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_PERSONAL, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_PERSONAL, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_PREMIUM, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_PREMIUM, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_BUSINESS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM_2_YEARS ] );

		expect(
			findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PERSONAL_2_YEARS ] );

		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PERSONAL_2_YEARS ] );
		expect(
			findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { type: TYPE_FREE, group: GROUP_WPCOM } )
		).to.deep.equal( [] );
	} );

	test( 'should return a proper similar plan - by type and group - jetpack', () => {
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS, group: GROUP_JETPACK } )
		).to.deep.equal( [ PLAN_JETPACK_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_PREMIUM, group: GROUP_JETPACK } )
		).to.deep.equal( [ PLAN_JETPACK_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_BUSINESS, group: GROUP_JETPACK } )
		).to.deep.equal( [ PLAN_JETPACK_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_PERSONAL, group: GROUP_JETPACK } )
		).to.deep.equal( [ PLAN_JETPACK_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PREMIUM, group: GROUP_JETPACK } )
		).to.deep.equal( [ PLAN_JETPACK_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL, group: GROUP_JETPACK } )
		).to.deep.equal( [ PLAN_JETPACK_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, {
				type: TYPE_BUSINESS,
				group: GROUP_JETPACK,
			} )
		).to.deep.equal( [ PLAN_JETPACK_BUSINESS_MONTHLY ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, {
				type: TYPE_PREMIUM,
				group: GROUP_JETPACK,
			} )
		).to.deep.equal( [ PLAN_JETPACK_PREMIUM_MONTHLY ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM_MONTHLY, {
				type: TYPE_BUSINESS,
				group: GROUP_JETPACK,
			} )
		).to.deep.equal( [ PLAN_JETPACK_BUSINESS_MONTHLY ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM_MONTHLY, {
				type: TYPE_PERSONAL,
				group: GROUP_JETPACK,
			} )
		).to.deep.equal( [ PLAN_JETPACK_PERSONAL_MONTHLY ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, {
				type: TYPE_PREMIUM,
				group: GROUP_JETPACK,
			} )
		).to.deep.equal( [ PLAN_JETPACK_PREMIUM_MONTHLY ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS_MONTHLY, {
				type: TYPE_PERSONAL,
				group: GROUP_JETPACK,
			} )
		).to.deep.equal( [ PLAN_JETPACK_PERSONAL_MONTHLY ] );
	} );

	test( 'should return a proper similar plan - by type and group - wp.com / jetpack', () => {
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_BUSINESS, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_BUSINESS ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PREMIUM, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PREMIUM, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PREMIUM ] );
		expect(
			findSimilarPlansKeys( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL, group: GROUP_WPCOM } )
		).to.deep.equal( [ PLAN_PERSONAL ] );

		expect(
			findSimilarPlansKeys( PLAN_JETPACK_PERSONAL_MONTHLY, {
				type: TYPE_BUSINESS,
				group: GROUP_WPCOM,
			} )
		).to.deep.equal( [ PLAN_BUSINESS_MONTHLY ] );
	} );
} );

describe( 'findPlansKeys', () => {
	test( 'all matching plans keys - by term', () => {
		expect( findPlansKeys( { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_BLOGGER_2_YEARS,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE_2_YEARS,
		] );
		expect( findPlansKeys( { term: TERM_ANNUALLY } ) ).to.deep.equal( [
			PLAN_FREE,
			PLAN_BLOGGER,
			PLAN_PERSONAL,
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_ECOMMERCE,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_REALTIME,
			PLAN_JETPACK_COMPLETE,
		] );
		expect( findPlansKeys( { term: TERM_MONTHLY } ) ).to.deep.equal( [
			PLAN_PERSONAL_MONTHLY,
			PLAN_PREMIUM_MONTHLY,
			PLAN_BUSINESS_MONTHLY,
			PLAN_ECOMMERCE_MONTHLY,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			PLAN_JETPACK_COMPLETE_MONTHLY,
			PLAN_P2_PLUS,
		] );
	} );

	test( 'all matching plans keys - by type', () => {
		expect( findPlansKeys( { type: TYPE_FREE } ) ).to.deep.equal( [
			PLAN_FREE,
			PLAN_JETPACK_FREE,
		] );
		expect( findPlansKeys( { type: TYPE_BLOGGER } ) ).to.deep.equal( [
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
		] );
		expect( findPlansKeys( { type: TYPE_PERSONAL } ) ).to.deep.equal( [
			PLAN_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect( findPlansKeys( { type: TYPE_PREMIUM } ) ).to.deep.equal( [
			PLAN_PREMIUM_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findPlansKeys( { type: TYPE_BUSINESS } ) ).to.deep.equal( [
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );

	test( 'all matching plans keys - by group', () => {
		expect( findPlansKeys( { group: GROUP_WPCOM } ) ).to.deep.equal( [
			PLAN_FREE,
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
			PLAN_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE_MONTHLY,
			PLAN_ECOMMERCE,
			PLAN_ECOMMERCE_2_YEARS,
			PLAN_P2_PLUS,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK } ) ).to.deep.equal( [
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
			PLAN_JETPACK_COMPLETE,
			PLAN_JETPACK_COMPLETE_MONTHLY,
		] );
	} );
	test( 'all matching plans keys - by group and type', () => {
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BLOGGER } ) ).to.deep.equal( [
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PERSONAL } ) ).to.deep.equal( [
			PLAN_PERSONAL_MONTHLY,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PREMIUM } ) ).to.deep.equal( [
			PLAN_PREMIUM_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BUSINESS } ) ).to.deep.equal( [
			PLAN_BUSINESS_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_BLOGGER } ) ).to.deep.equal( [] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PERSONAL } ) ).to.deep.equal( [
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_PREMIUM } ) ).to.deep.equal( [
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK, type: TYPE_BUSINESS } ) ).to.deep.equal( [
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );
} );

describe( 'planMatches - general', () => {
	test( 'should throw an error if called with unknown query parameter', () => {
		expect( () => planMatches( PLAN_PERSONAL, { test: 123 } ) ).to.throw();
	} );
} );

describe( 'planMatches - personal', () => {
	test( 'should return true for matching queries', () => {
		expect( planMatches( PLAN_PERSONAL, { type: TYPE_PERSONAL } ) ).to.equal( true );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { type: TYPE_PERSONAL } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { type: TYPE_PERSONAL } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { type: TYPE_PERSONAL } ) ).to.equal(
			true
		);

		expect( planMatches( PLAN_PERSONAL, { group: GROUP_WPCOM } ) ).to.equal( true );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { group: GROUP_WPCOM } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { group: GROUP_JETPACK } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { group: GROUP_JETPACK } ) ).to.equal(
			true
		);

		expect( planMatches( PLAN_PERSONAL, { term: TERM_ANNUALLY } ) ).to.equal( true );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { term: TERM_BIENNIALLY } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { term: TERM_ANNUALLY } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_MONTHLY } ) ).to.equal( true );
	} );
	test( 'should return false for non-matching queries', () => {
		expect( planMatches( PLAN_PERSONAL, { type: TYPE_BUSINESS } ) ).to.equal( false );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { type: TYPE_BUSINESS } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { type: TYPE_BUSINESS } ) ).to.equal(
			false
		);

		expect( planMatches( PLAN_PERSONAL, { group: GROUP_JETPACK } ) ).to.equal( false );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { group: GROUP_JETPACK } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { group: GROUP_WPCOM } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { group: GROUP_WPCOM } ) ).to.equal(
			false
		);

		expect( planMatches( PLAN_PERSONAL, { term: TERM_MONTHLY } ) ).to.equal( false );
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { term: TERM_ANNUALLY } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL, { term: TERM_MONTHLY } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_ANNUALLY } ) ).to.equal(
			false
		);
	} );
} );

describe( 'planMatches - business', () => {
	test( 'should return true for matching queries', () => {
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS } ) ).to.equal( true );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { type: TYPE_BUSINESS } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { type: TYPE_BUSINESS } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { type: TYPE_BUSINESS } ) ).to.equal(
			true
		);

		expect( planMatches( PLAN_BUSINESS, { group: GROUP_WPCOM } ) ).to.equal( true );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { group: GROUP_WPCOM } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { group: GROUP_JETPACK } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { group: GROUP_JETPACK } ) ).to.equal(
			true
		);

		expect( planMatches( PLAN_BUSINESS, { term: TERM_ANNUALLY } ) ).to.equal( true );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { term: TERM_BIENNIALLY } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { term: TERM_ANNUALLY } ) ).to.equal( true );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_MONTHLY } ) ).to.equal( true );

		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) ).to.equal(
			true
		);
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, term: TERM_ANNUALLY } ) ).to.equal(
			true
		);
		expect(
			planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, group: GROUP_WPCOM, term: TERM_ANNUALLY } )
		).to.equal( true );
	} );
	test( 'should return false for non-matching queries', () => {
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_PERSONAL } ) ).to.equal( false );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { type: TYPE_PERSONAL } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { type: TYPE_PERSONAL } ) ).to.equal(
			false
		);

		expect( planMatches( PLAN_BUSINESS, { group: GROUP_JETPACK } ) ).to.equal( false );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { group: GROUP_JETPACK } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { group: GROUP_WPCOM } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { group: GROUP_WPCOM } ) ).to.equal(
			false
		);

		expect( planMatches( PLAN_BUSINESS, { term: TERM_MONTHLY } ) ).to.equal( false );
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { term: TERM_ANNUALLY } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS, { term: TERM_MONTHLY } ) ).to.equal( false );
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_ANNUALLY } ) ).to.equal(
			false
		);
	} );
} );

describe( 'planHasFeature', () => {
	test( 'should return true when a plan has a plan compare feature', () => {
		expect( planHasFeature( PLAN_PERSONAL, FEATURE_CUSTOM_DOMAIN ) ).to.be.true;
	} );

	test( 'should return true when a plan has a sign-up specific feature', () => {
		expect( planHasFeature( PLAN_PREMIUM, FEATURE_ALL_PERSONAL_FEATURES ) ).to.be.true;
	} );

	test( 'should return true when a plan has a hidden feature', () => {
		expect( planHasFeature( PLAN_BUSINESS, FEATURE_AUDIO_UPLOADS ) ).to.be.true;
	} );

	test( 'should return false when a plan does not have a feature', () => {
		expect( planHasFeature( PLAN_PERSONAL, FEATURE_VIDEO_UPLOADS ) ).to.be.false;
	} );
} );

describe( 'planHasSuperiorFeature', () => {
	test( 'should return true when a yearly plan has a superior feature', () => {
		expect( planHasSuperiorFeature( PLAN_JETPACK_BUSINESS, FEATURE_JETPACK_BACKUP_DAILY ) ).to.be
			.true;
	} );

	test( 'should return true when a monthly plan has a superior feature', () => {
		expect( planHasSuperiorFeature( PLAN_JETPACK_BUSINESS_MONTHLY, FEATURE_JETPACK_BACKUP_DAILY ) )
			.to.be.true;
	} );

	test( 'should return false when a yearly plan does not have a superior feature', () => {
		expect( planHasSuperiorFeature( PLAN_JETPACK_BUSINESS, FEATURE_JETPACK_BACKUP_REALTIME ) ).to.be
			.false;
	} );

	test( 'should return false when a monthly plan does not have a superior feature', () => {
		expect(
			planHasSuperiorFeature( PLAN_JETPACK_BUSINESS_MONTHLY, FEATURE_JETPACK_BACKUP_REALTIME )
		).to.be.false;
	} );
} );
