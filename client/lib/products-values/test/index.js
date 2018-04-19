/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { isJetpackPlan, isMonthly, isYearly, isBiennially } from '..';
import {
	JETPACK_PLANS,
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from 'lib/plans/constants';

/**
 * Test helper to build a product object
 *
 * @param  {String} product_slug Product slug
 * @return {Object}              Object containing product_slug
 */
const makeProductFromSlug = product_slug => ( { product_slug } );

describe( 'isJetpackPlan', () => {
	test( 'should return true for Jetpack products', () => {
		JETPACK_PLANS.map( makeProductFromSlug ).forEach( product =>
			expect( isJetpackPlan( product ) ).toBe( true )
		);
	} );

	test( 'should return false for non-Jetpack products', () => {
		const nonJetpackPlans = [ PLAN_BUSINESS, PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ];

		nonJetpackPlans
			.map( makeProductFromSlug )
			.forEach( product => expect( isJetpackPlan( product ) ).toBe( false ) );
	} );
} );

describe( 'isMonthly', () => {
	test( 'should return true for monthly products', () => {
		expect( isMonthly( { bill_period: 31 } ) ).toBe( true );
	} );
	test( 'should return true for other products', () => {
		expect( isMonthly( { bill_period: 30 } ) ).toBe( false );
		expect( isMonthly( { bill_period: 32 } ) ).toBe( false );
		expect( isMonthly( { bill_period: 365 } ) ).toBe( false );
	} );
} );

describe( 'isYearly', () => {
	test( 'should return true for yearly products', () => {
		expect( isYearly( { bill_period: 365 } ) ).toBe( true );
	} );
	test( 'should return true for other products', () => {
		expect( isYearly( { bill_period: 700 } ) ).toBe( false );
		expect( isYearly( { bill_period: 31 } ) ).toBe( false );
		expect( isYearly( { bill_period: 364 } ) ).toBe( false );
	} );
} );

describe( 'isBiennially', () => {
	test( 'should return true for biennial products', () => {
		expect( isBiennially( { bill_period: 730 } ) ).toBe( true );
	} );
	test( 'should return true for other products', () => {
		expect( isBiennially( { bill_period: 365 } ) ).toBe( false );
		expect( isBiennially( { bill_period: 31 } ) ).toBe( false );
		expect( isBiennially( { bill_period: 731 } ) ).toBe( false );
	} );
} );
