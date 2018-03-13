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
} from '../constants';
import { isBusinessPlan, isPersonalPlan, isPremiumPlan, planMatches } from '../index';

describe( 'isBusinessPlan', () => {
	test( 'should return true for all business plans', () => {
		expect( isBusinessPlan( PLAN_BUSINESS ) ).to.be.true;
		expect( isBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).to.be.true;
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS ) ).to.be.true;
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.be.true;
	} );
	test( 'should return false for all non-business plans', () => {
		expect( isBusinessPlan( PLAN_FREE ) ).to.be.false;
		expect( isBusinessPlan( PLAN_PERSONAL ) ).to.be.false;
		expect( isBusinessPlan( PLAN_PERSONAL_2_YEARS ) ).to.be.false;
		expect( isBusinessPlan( PLAN_PREMIUM ) ).to.be.false;
		expect( isBusinessPlan( PLAN_PREMIUM_2_YEARS ) ).to.be.false;
		expect( isBusinessPlan( PLAN_JETPACK_FREE ) ).to.be.false;
		expect( isBusinessPlan( PLAN_JETPACK_PERSONAL ) ).to.be.false;
		expect( isBusinessPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.be.false;
		expect( isBusinessPlan( PLAN_JETPACK_PREMIUM ) ).to.be.false;
		expect( isBusinessPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.be.false;
	} );
} );

describe( 'isPremiumPlan', () => {
	test( 'should return true for all premium plans', () => {
		expect( isPremiumPlan( PLAN_PREMIUM ) ).to.be.true;
		expect( isPremiumPlan( PLAN_PREMIUM_2_YEARS ) ).to.be.true;
		expect( isPremiumPlan( PLAN_JETPACK_PREMIUM ) ).to.be.true;
		expect( isPremiumPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.be.true;
	} );
	test( 'should return false for all non-premium plans', () => {
		expect( isPremiumPlan( PLAN_FREE ) ).to.be.false;
		expect( isPremiumPlan( PLAN_BUSINESS ) ).to.be.false;
		expect( isPremiumPlan( PLAN_BUSINESS_2_YEARS ) ).to.be.false;
		expect( isPremiumPlan( PLAN_PERSONAL ) ).to.be.false;
		expect( isPremiumPlan( PLAN_PERSONAL_2_YEARS ) ).to.be.false;
		expect( isPremiumPlan( PLAN_JETPACK_FREE ) ).to.be.false;
		expect( isPremiumPlan( PLAN_JETPACK_PERSONAL ) ).to.be.false;
		expect( isPremiumPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.be.false;
		expect( isPremiumPlan( PLAN_JETPACK_BUSINESS ) ).to.be.false;
		expect( isPremiumPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.be.false;
	} );
} );

describe( 'isPersonalPlan', () => {
	test( 'should return true for all personal plans', () => {
		expect( isPersonalPlan( PLAN_PERSONAL ) ).to.be.true;
		expect( isPersonalPlan( PLAN_PERSONAL_2_YEARS ) ).to.be.true;
		expect( isPersonalPlan( PLAN_JETPACK_PERSONAL ) ).to.be.true;
		expect( isPersonalPlan( PLAN_JETPACK_PERSONAL_MONTHLY ) ).to.be.true;
	} );
	test( 'should return false for all non-personal plans', () => {
		expect( isPersonalPlan( PLAN_FREE ) ).to.be.false;
		expect( isPersonalPlan( PLAN_JETPACK_FREE ) ).to.be.false;
		expect( isPersonalPlan( PLAN_PREMIUM ) ).to.be.false;
		expect( isPersonalPlan( PLAN_PREMIUM_2_YEARS ) ).to.be.false;
		expect( isPersonalPlan( PLAN_BUSINESS ) ).to.be.false;
		expect( isPersonalPlan( PLAN_BUSINESS_2_YEARS ) ).to.be.false;
		expect( isPersonalPlan( PLAN_JETPACK_PREMIUM ) ).to.be.false;
		expect( isPersonalPlan( PLAN_JETPACK_PREMIUM_MONTHLY ) ).to.be.false;
		expect( isPersonalPlan( PLAN_JETPACK_BUSINESS ) ).to.be.false;
		expect( isPersonalPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.be.false;
	} );
} );

describe( 'planMatches - general', () => {
	test( 'should throw an error if called with unknown query parameter', () => {
		expect( () => planMatches( PLAN_PERSONAL, { test: 123 } ) ).to.throw();
	} );
} );

describe( 'planMatches - personal', () => {
	test( 'should return true for matching queries', () => {
		expect( planMatches( PLAN_PERSONAL, { type: TYPE_PERSONAL } ) ).to.be.true;
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { type: TYPE_PERSONAL } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_PERSONAL, { type: TYPE_PERSONAL } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { type: TYPE_PERSONAL } ) ).to.be.true;

		expect( planMatches( PLAN_PERSONAL, { group: GROUP_WPCOM } ) ).to.be.true;
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { group: GROUP_WPCOM } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_PERSONAL, { group: GROUP_JETPACK } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { group: GROUP_JETPACK } ) ).to.be.true;

		expect( planMatches( PLAN_PERSONAL, { term: TERM_ANNUALLY } ) ).to.be.true;
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { term: TERM_BIENNIALLY } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_PERSONAL, { term: TERM_ANNUALLY } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_MONTHLY } ) ).to.be.true;
	} );
	test( 'should return false for non-matching queries', () => {
		expect( planMatches( PLAN_PERSONAL, { type: TYPE_BUSINESS } ) ).to.be.false;
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { type: TYPE_BUSINESS } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_PERSONAL, { type: TYPE_BUSINESS } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { type: TYPE_BUSINESS } ) ).to.be.false;

		expect( planMatches( PLAN_PERSONAL, { group: GROUP_JETPACK } ) ).to.be.false;
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { group: GROUP_JETPACK } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_PERSONAL, { group: GROUP_WPCOM } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { group: GROUP_WPCOM } ) ).to.be.false;

		expect( planMatches( PLAN_PERSONAL, { term: TERM_MONTHLY } ) ).to.be.false;
		expect( planMatches( PLAN_PERSONAL_2_YEARS, { term: TERM_ANNUALLY } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_PERSONAL, { term: TERM_MONTHLY } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_PERSONAL_MONTHLY, { term: TERM_ANNUALLY } ) ).to.be.false;
	} );
} );

describe( 'planMatches - business', () => {
	test( 'should return true for matching queries', () => {
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS } ) ).to.be.true;
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { type: TYPE_BUSINESS } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_BUSINESS, { type: TYPE_BUSINESS } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { type: TYPE_BUSINESS } ) ).to.be.true;

		expect( planMatches( PLAN_BUSINESS, { group: GROUP_WPCOM } ) ).to.be.true;
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { group: GROUP_WPCOM } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_BUSINESS, { group: GROUP_JETPACK } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { group: GROUP_JETPACK } ) ).to.be.true;

		expect( planMatches( PLAN_BUSINESS, { term: TERM_ANNUALLY } ) ).to.be.true;
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { term: TERM_BIENNIALLY } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_BUSINESS, { term: TERM_ANNUALLY } ) ).to.be.true;
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_MONTHLY } ) ).to.be.true;

		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) ).to.be.true;
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, term: TERM_ANNUALLY } ) ).to.be.true;
		expect(
			planMatches( PLAN_BUSINESS, { type: TYPE_BUSINESS, group: GROUP_WPCOM, term: TERM_ANNUALLY } )
		).to.be.true;
	} );
	test( 'should return false for non-matching queries', () => {
		expect( planMatches( PLAN_BUSINESS, { type: TYPE_PERSONAL } ) ).to.be.false;
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { type: TYPE_PERSONAL } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_BUSINESS, { type: TYPE_PERSONAL } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { type: TYPE_PERSONAL } ) ).to.be.false;

		expect( planMatches( PLAN_BUSINESS, { group: GROUP_JETPACK } ) ).to.be.false;
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { group: GROUP_JETPACK } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_BUSINESS, { group: GROUP_WPCOM } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { group: GROUP_WPCOM } ) ).to.be.false;

		expect( planMatches( PLAN_BUSINESS, { term: TERM_MONTHLY } ) ).to.be.false;
		expect( planMatches( PLAN_BUSINESS_2_YEARS, { term: TERM_ANNUALLY } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_BUSINESS, { term: TERM_MONTHLY } ) ).to.be.false;
		expect( planMatches( PLAN_JETPACK_BUSINESS_MONTHLY, { term: TERM_ANNUALLY } ) ).to.be.false;
	} );
} );
