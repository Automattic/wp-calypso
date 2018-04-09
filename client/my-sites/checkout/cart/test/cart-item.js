/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { pick, identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { CartItem } from '../cart-item';
import { isPlan, isMonthly } from 'lib/products-values';
import {
	PLAN_BUSINESS_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '../../../../lib/plans/constants';

const plansModule = require( 'lib/plans' );
const originalPlansModuleFunctions = pick( plansModule, [
	'calculateMonthlyPriceForPlan',
	'getBillingMonthsForPlan',
] );
const mockPlansModule = () => {
	plansModule.calculateMonthlyPriceForPlan = jest.fn( () => 120 );
	plansModule.getBillingMonthsForPlan = jest.fn( () => 10 );
};
mockPlansModule();

jest.mock( 'lib/mixins/analytics', () => ( {} ) );
jest.mock( 'lib/products-values', () => ( {
	isPlan: jest.fn( () => null ),
	isTheme: jest.fn( () => null ),
	isMonthly: jest.fn( () => null ),
	isBundled: jest.fn( () => null ),
	isCredits: jest.fn( () => null ),
	isGoogleApps: jest.fn( () => null ),
} ) );

const cartItem = {
	cost: 120,
	bill_period: 1,
	volume: 1,
	product_name: 'name!',
	product_slug: 'plan_value_bundle',
};

const translate = jest.fn( identity );
const props = {
	cartItem,
	translate,
};

describe( 'cart-item', () => {
	test( 'Does not blow up', () => {
		const comp = shallow( <CartItem { ...props } /> );
		expect( comp.find( '.cart-item' ).length ).toBe( 1 );
	} );

	describe( 'monthlyPriceApplies', () => {
		beforeEach( () => {
			isPlan.mockImplementation( () => true );
			isMonthly.mockImplementation( () => false );
		} );

		test( 'Returns false if cartItem is not a plan', () => {
			isPlan.mockImplementation( () => false );
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
				},
			} );
			expect( instance.monthlyPriceApplies() ).toBe( false );
		} );

		test( 'Returns false if plan is a monthly plan', () => {
			isMonthly.mockImplementation( () => true );
			const instance = new CartItem( props );
			expect( instance.monthlyPriceApplies() ).toBe( false );
		} );

		test( 'Returns false if cost is undefined', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					cost: undefined,
				},
			} );
			expect( instance.monthlyPriceApplies() ).toBe( false );
		} );

		test( 'Returns false if cost is 0', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					cost: 0,
				},
			} );
			expect( instance.monthlyPriceApplies() ).toBe( false );
		} );

		test( 'Returns false if cost is less than 0', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					cost: -1,
				},
			} );
			expect( instance.monthlyPriceApplies() ).toBe( false );
		} );

		test( 'Returns true if plan is not a monthly plan', () => {
			const instance = new CartItem( props );
			expect( instance.monthlyPriceApplies() ).toBe( true );
		} );
	} );

	describe( 'calcMonthlyBillingDetails - mocks', () => {
		const { calculateMonthlyPriceForPlan, getBillingMonthsForPlan } = plansModule;
		beforeEach( () => {
			calculateMonthlyPriceForPlan.mockReset();
			calculateMonthlyPriceForPlan.mockImplementation( () => 299 );

			getBillingMonthsForPlan.mockReset();
			getBillingMonthsForPlan.mockImplementation( () => 36 );
		} );

		test( 'Calls calculateMonthlyPriceForPlan to compute details', () => {
			const instance = new CartItem( props );
			instance.calcMonthlyBillingDetails();
			expect( calculateMonthlyPriceForPlan ).toHaveBeenCalledTimes( 1 );
			expect( calculateMonthlyPriceForPlan ).toHaveBeenCalledWith( 'plan_value_bundle', 120 );

			expect( getBillingMonthsForPlan ).toHaveBeenCalledTimes( 1 );
			expect( getBillingMonthsForPlan ).toHaveBeenCalledWith( 'plan_value_bundle' );
		} );

		test( 'Uses values returned by calculateMonthlyPriceForPlan', () => {
			const instance = new CartItem( props );
			const details = instance.calcMonthlyBillingDetails();
			expect( details ).toEqual( {
				monthlyPrice: 299,
				months: 36,
			} );
		} );
	} );

	describe( 'calcMonthlyBillingDetails - real callbacks', () => {
		beforeAll( () => {
			// restore original functions
			for ( const key in originalPlansModuleFunctions ) {
				plansModule[ key ] = originalPlansModuleFunctions[ key ];
			}
		} );

		afterAll( () => {
			mockPlansModule();
		} );

		const expectations = [
			[ { product_slug: PLAN_PERSONAL, cost: 120 }, { months: 12, monthlyPrice: 10 } ],
			[ { product_slug: PLAN_PREMIUM, cost: 180 }, { months: 12, monthlyPrice: 15 } ],
			[ { product_slug: PLAN_BUSINESS_2_YEARS, cost: 480 }, { months: 24, monthlyPrice: 20 } ],
			[ { product_slug: PLAN_JETPACK_PERSONAL, cost: 288 }, { months: 12, monthlyPrice: 24 } ],
		];

		expectations.forEach( ( [ input, output ] ) => {
			test( `Returns correct values for annual plan ${ input.product_slug }`, () => {
				const instance = new CartItem( {
					...props,
					cartItem: {
						...cartItem,
						...input,
					},
				} );
				expect( instance.calcMonthlyBillingDetails() ).toEqual( output );
			} );
		} );

		test( 'Throws an error for an unknown plan', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					product_slug: 'fake',
				},
			} );
			expect( () => instance.calcMonthlyBillingDetails() ).toThrowError();
		} );
	} );
} );
