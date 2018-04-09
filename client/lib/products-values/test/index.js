/** @format */

/**
 * Internal dependencies
 */
import {
	isJetpackPlan,
	isPersonal,
	isPremium,
	isBusiness,
	isFreePlan,
	isFreeJetpackPlan,
} from '..';

import {
	JETPACK_PLANS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_HOST_BUNDLE,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_CHARGEBACK,
	PLAN_MONTHLY_PERIOD,
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

describe( 'isPersonal', () => {
	test( 'should return true for personal products', () => {
		const PERSONAL_PRODUCTS = [
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		];
		PERSONAL_PRODUCTS.map( makeProductFromSlug ).forEach( product =>
			expect( isPersonal( product ) ).toBe( true )
		);
	} );

	test( 'should return false for non-personal products', () => {
		const NON_PERSONAL_PRODUCTS = [
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_FREE,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_HOST_BUNDLE,
			PLAN_WPCOM_ENTERPRISE,
			PLAN_CHARGEBACK,
			PLAN_MONTHLY_PERIOD,
		];

		NON_PERSONAL_PRODUCTS.map( makeProductFromSlug ).forEach( product =>
			expect( isPersonal( product ) ).toBe( false )
		);
	} );
} );

describe( 'isPremium', () => {
	test( 'should return true for premium products', () => {
		const PREMIUM_PRODUCTS = [
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
		];
		PREMIUM_PRODUCTS.map( makeProductFromSlug ).forEach( product =>
			expect( isPremium( product ) ).toBe( true )
		);
	} );

	test( 'should return false for non-premium products', () => {
		const NON_PREMIUM_PRODUCTS = [
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_FREE,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
			PLAN_HOST_BUNDLE,
			PLAN_WPCOM_ENTERPRISE,
			PLAN_CHARGEBACK,
			PLAN_MONTHLY_PERIOD,
		];

		NON_PREMIUM_PRODUCTS.map( makeProductFromSlug ).forEach( product =>
			expect( isPremium( product ) ).toBe( false )
		);
	} );
} );

describe( 'isBusiness', () => {
	test( 'should return true for business products', () => {
		const BUSINESS_PRODUCTS = [
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		];
		BUSINESS_PRODUCTS.map( makeProductFromSlug ).forEach( product =>
			expect( isBusiness( product ) ).toBe( true )
		);
	} );

	test( 'should return false for non-business products', () => {
		const NON_BUSINESS_PRODUCTS = [
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_FREE,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_HOST_BUNDLE,
			PLAN_WPCOM_ENTERPRISE,
			PLAN_CHARGEBACK,
			PLAN_MONTHLY_PERIOD,
		];

		NON_BUSINESS_PRODUCTS.map( makeProductFromSlug ).forEach( product =>
			expect( isBusiness( product ) ).toBe( false )
		);
	} );
} );

describe( 'isFreePlan', () => {
	test( 'should return true for free plan', () => {
		expect( isFreePlan( PLAN_FREE ) ).toBe( true );
	} );

	test( 'should return false for non-business products', () => {
		const OTHER_PLANS = [
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_HOST_BUNDLE,
			PLAN_WPCOM_ENTERPRISE,
			PLAN_CHARGEBACK,
			PLAN_MONTHLY_PERIOD,
		];

		OTHER_PLANS.map( makeProductFromSlug ).forEach( product =>
			expect( isFreePlan( product ) ).toBe( false )
		);
	} );
} );

describe( 'isFreeJetpackPlan', () => {
	test( 'should return true for free plan', () => {
		expect( isFreeJetpackPlan( PLAN_JETPACK_FREE ) ).toBe( true );
	} );

	test( 'should return false for non-business products', () => {
		const OTHER_PLANS = [
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_FREE,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_HOST_BUNDLE,
			PLAN_WPCOM_ENTERPRISE,
			PLAN_CHARGEBACK,
			PLAN_MONTHLY_PERIOD,
		];

		OTHER_PLANS.map( makeProductFromSlug ).forEach( product =>
			expect( isFreeJetpackPlan( product ) ).toBe( false )
		);
	} );
} );
