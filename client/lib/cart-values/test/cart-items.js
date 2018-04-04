/** @format */

import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';

const cartItems = require( '../cart-items' );
const { planItem, getItemForPlan } = cartItems;

/**
 * External dependencies
 */

describe( 'planItem()', () => {
	test( 'should return null for free plan', () => {
		expect( planItem( PLAN_FREE ) ).toBe( null );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
	].forEach( product_slug => {
		test( `should return an object for non-free plan (${ product_slug })`, () => {
			expect( planItem( product_slug ).product_slug ).toBe( product_slug );
		} );
	} );
} );

describe( 'getItemForPlan()', () => {
	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( product_slug => {
		test( `should return personal plan item for personal plan ${ product_slug }`, () => {
			expect( getItemForPlan( { product_slug } ).product_slug ).toBe( product_slug );
		} );
	} );
	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( product_slug => {
		test( `should return personal plan item for a premium plan ${ product_slug }`, () => {
			expect( getItemForPlan( { product_slug } ).product_slug ).toBe( product_slug );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( product_slug => {
		test( `should return personal plan item for a business plan ${ product_slug }`, () => {
			expect( getItemForPlan( { product_slug } ).product_slug ).toBe( product_slug );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( product_slug => {
		test( `should throw an error for plan ${ product_slug }`, () => {
			expect( () => getItemForPlan( { product_slug } ).product_slug ).toThrow();
		} );
	} );
} );
