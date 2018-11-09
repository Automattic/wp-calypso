/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	isJetpackPlan,
	isMonthly,
	isYearly,
	isBiennially,
	isPersonal,
	isPremium,
	isBusiness,
	isEcommerce,
	isPlan,
} from '..';
import {
	JETPACK_PLANS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Test helper to build a product object
 *
 * @param  {String} product_slug Product slug
 * @return {Object}              Object containing product_slug
 */
const makeProductFromSlug = product_slug => ( { product_slug } );

describe( 'isPlan', () => {
	test( 'should return true for paid products', () => {
		[
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE,
			PLAN_ECOMMERCE_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		]
			.map( makeProductFromSlug )
			.forEach( product => expect( isPlan( product ) ).toBe( true ) );
	} );

	test( 'should return false for free products', () => {
		expect( isPlan( makeProductFromSlug( PLAN_FREE ) ) ).toBe( false );
	} );
} );

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

describe( 'isPersonal', () => {
	test( 'should return true for personal products', () => {
		[ PLAN_PERSONAL, PLAN_PERSONAL_2_YEARS, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isPersonal( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-personal products', () => {
		[ PLAN_BUSINESS, PLAN_JETPACK_PREMIUM ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isPersonal( product ) ).toBe( false ) );
	} );
} );

describe( 'isPremium', () => {
	test( 'should return true for premium products', () => {
		[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isPremium( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-premium products', () => {
		[ PLAN_BUSINESS, PLAN_JETPACK_PERSONAL ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isPremium( product ) ).toBe( false ) );
	} );
} );

describe( 'isBusiness', () => {
	test( 'should return true for business products', () => {
		[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isBusiness( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-business products', () => {
		[ PLAN_PREMIUM, PLAN_JETPACK_PERSONAL ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isBusiness( product ) ).toBe( false ) );
	} );
} );

describe( 'isEcommerce', () => {
	test( 'should return true for eCommerce products', () => {
		[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isEcommerce( product ) ).toBe( true ) );
	} );

	test( 'should return false for non-eCommerec products', () => {
		[ PLAN_PREMIUM, PLAN_JETPACK_PERSONAL, PLAN_BUSINESS ]
			.map( makeProductFromSlug )
			.forEach( product => expect( isEcommerce( product ) ).toBe( false ) );
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
