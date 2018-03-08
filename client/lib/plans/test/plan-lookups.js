/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
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
} from '../constants';
import { isBusinessPlan, isPersonalPlan, isPremiumPlan } from '../index';

describe( 'isBusinessPlan', () => {
	test( 'should return true for all business plans', () => {
		expect( isBusinessPlan( PLAN_BUSINESS ) ).to.be.true;
		expect( isBusinessPlan( PLAN_BUSINESS_2_YEARS ) ).to.be.true;
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS ) ).to.be.true;
		expect( isBusinessPlan( PLAN_JETPACK_BUSINESS_MONTHLY ) ).to.be.true;
	} );
	test( 'should return true for all non-business plans', () => {
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
	test( 'should return true for all non-premium plans', () => {
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
