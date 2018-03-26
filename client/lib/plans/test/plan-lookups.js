/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GROUP_JETPACK,
	GROUP_WPCOM,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TYPE_BUSINESS,
	TYPE_PERSONAL,
	PLANS_LIST,
	TYPE_PREMIUM,
	TYPE_FREE,
	getPlanClass,
} from '../constants';
import {
	getPlan,
	isBusinessPlan,
	isPersonalPlan,
	isPremiumPlan,
	planMatches,
	findSimilarPlansKeys,
	findPlansKeys,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	isFreePlan,
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
		expect( getYearlyPlanByMonthly( 'unknown_plan' ) ).to.equal( '' );
	} );
} );

describe( 'getPlanClass', () => {
	test( 'should return a proper class', () => {
		expect( getPlanClass( PLAN_FREE ) ).to.equal( 'is-free-plan' );
		expect( getPlanClass( PLAN_JETPACK_FREE ) ).to.equal( 'is-free-plan' );
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
		expect( findSimilarPlansKeys( PLAN_PERSONAL, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_PERSONAL_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_PREMIUM, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_PREMIUM_2_YEARS,
		] );
		expect( findSimilarPlansKeys( PLAN_BUSINESS, { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_BUSINESS_2_YEARS,
		] );

		expect( findSimilarPlansKeys( PLAN_PREMIUM_2_YEARS, { term: TERM_ANNUALLY } ) ).to.deep.equal( [
			PLAN_PREMIUM,
		] );
		expect( findSimilarPlansKeys( PLAN_PERSONAL_2_YEARS, { term: TERM_ANNUALLY } ) ).to.deep.equal(
			[ PLAN_PERSONAL ]
		);
		expect( findSimilarPlansKeys( PLAN_BUSINESS_2_YEARS, { term: TERM_ANNUALLY } ) ).to.deep.equal(
			[ PLAN_BUSINESS ]
		);

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
		).to.deep.equal( [] );
	} );
} );

describe( 'findPlansKeys', () => {
	test( 'all matching plans keys - by term', () => {
		expect( findPlansKeys( { term: TERM_BIENNIALLY } ) ).to.deep.equal( [
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS_2_YEARS,
		] );
		expect( findPlansKeys( { term: TERM_ANNUALLY } ) ).to.deep.equal( [
			PLAN_FREE,
			PLAN_PERSONAL,
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_BUSINESS,
		] );
		expect( findPlansKeys( { term: TERM_MONTHLY } ) ).to.deep.equal( [
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );

	test( 'all matching plans keys - by type', () => {
		expect( findPlansKeys( { type: TYPE_FREE } ) ).to.deep.equal( [
			PLAN_FREE,
			PLAN_JETPACK_FREE,
		] );
		expect( findPlansKeys( { type: TYPE_PERSONAL } ) ).to.deep.equal( [
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		] );
		expect( findPlansKeys( { type: TYPE_PREMIUM } ) ).to.deep.equal( [
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
		] );
		expect( findPlansKeys( { type: TYPE_BUSINESS } ) ).to.deep.equal( [
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );

	test( 'all matching plans keys - by group', () => {
		expect( findPlansKeys( { group: GROUP_WPCOM } ) ).to.deep.equal( [
			PLAN_FREE,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_JETPACK } ) ).to.deep.equal( [
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		] );
	} );
	test( 'all matching plans keys - by group and type', () => {
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PERSONAL } ) ).to.deep.equal( [
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_PREMIUM } ) ).to.deep.equal( [
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
		] );
		expect( findPlansKeys( { group: GROUP_WPCOM, type: TYPE_BUSINESS } ) ).to.deep.equal( [
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
		] );
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
