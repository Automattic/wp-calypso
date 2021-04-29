/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import { CartItem } from '../cart-item';
import {
	isPlan,
	isMonthly,
	isYearly,
	isBiennially,
	isBundled,
	isDomainProduct,
	calculateMonthlyPriceForPlan,
	getBillingMonthsForPlan,
} from '@automattic/calypso-products';

jest.mock( '@automattic/calypso-config', () => {
	const fn = () => {};
	fn.isEnabled = jest.fn( () => null );
	return fn;
} );
jest.mock( '@automattic/format-currency', () => ( {
	getCurrencyObject: ( price ) => ( { integer: price } ),
} ) );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	calculateMonthlyPriceForPlan: jest.fn( () => 120 ),
	getBillingMonthsForPlan: jest.fn( () => 10 ),
	isPlan: jest.fn( () => null ),
	isTheme: jest.fn( () => null ),
	isMonthly: jest.fn( () => null ),
	isYearly: jest.fn( () => null ),
	isBiennially: jest.fn( () => null ),
	isBundled: jest.fn( () => null ),
	isDomainProduct: jest.fn( () => null ),
	isCredits: jest.fn( () => null ),
	isGSuiteOrExtraLicenseOrGoogleWorkspace: jest.fn( () => null ),
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
		expect( comp.find( '.cart-item' ) ).toHaveLength( 1 );
	} );

	describe( 'monthlyPrice', () => {
		let myTranslate;
		let instance;
		beforeEach( () => {
			myTranslate = jest.fn( identity );
			instance = new CartItem( {
				translate: myTranslate,
				cartItem: {
					currency: 'AUD',
				},
			} );
			instance.monthlyPriceApplies = jest.fn( () => true );
			instance.calcMonthlyBillingDetails = jest.fn( () => ( {
				months: 17,
				monthlyPrice: 133,
			} ) );
		} );

		test( 'Should call monthlyPriceApplies(), monthlyPriceApplies()', () => {
			instance.monthlyPrice();
			expect( instance.monthlyPriceApplies ).toHaveBeenCalledTimes( 1 );
			expect( instance.calcMonthlyBillingDetails ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'Should call translate() with args returned from calcMonthlyBillingDetails()', () => {
			instance.monthlyPrice();
			expect( myTranslate ).toHaveBeenCalledTimes( 1 );
			expect( myTranslate.mock.calls[ 0 ][ 1 ] ).toEqual( {
				args: {
					monthlyPrice: '133',
					currency: 'AUD',
					months: 17,
				},
			} );
		} );
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

	describe( 'getSubscriptionLength() - bundled domains', () => {
		beforeAll( () => {
			isMonthly.mockImplementation( () => false );
			isYearly.mockImplementation( () => true );
			isBiennially.mockImplementation( () => false );
		} );

		const instance = new CartItem( { ...props, cartItem: { cost: 0, bill_period: 1 } } );

		test( 'Returns false for bundled domains', () => {
			isEnabled.mockImplementation( () => true );
			isDomainProduct.mockImplementation( () => true );
			isBundled.mockImplementation( () => true );
			expect( instance.getSubscriptionLength() ).toEqual( false );
		} );

		test( 'Returns "annual subscription" for non-bundled domains', () => {
			isEnabled.mockImplementation( () => true );
			isDomainProduct.mockImplementation( () => true );
			isBundled.mockImplementation( () => false );

			expect( instance.getSubscriptionLength() ).toEqual( 'annual subscription' );
		} );
	} );

	describe( 'getSubscriptionLength()', () => {
		test( 'Returns false values for cart item with invalid bill_period (0)', () => {
			const instance = new CartItem( { ...props, cartItem: { bill_period: 0 } } );
			isMonthly.mockImplementation( () => true );
			isYearly.mockImplementation( () => false );
			isBiennially.mockImplementation( () => false );
			expect( instance.getSubscriptionLength() ).toEqual( false );
		} );

		test( 'Returns false values for cart item with invalid bill_period (-1)', () => {
			const instance = new CartItem( { ...props, cartItem: { bill_period: -1 } } );
			isMonthly.mockImplementation( () => true );
			isYearly.mockImplementation( () => false );
			isBiennially.mockImplementation( () => false );
			expect( instance.getSubscriptionLength() ).toEqual( false );
		} );

		test( 'Returns false values for cart item with invalid bill_period (4)', () => {
			const instance = new CartItem( { ...props, cartItem: { bill_period: -1 } } );
			isMonthly.mockImplementation( () => true );
			isYearly.mockImplementation( () => false );
			isBiennially.mockImplementation( () => false );
			expect( instance.getSubscriptionLength() ).toEqual( false );
		} );

		test( 'Returns "monthly subscription" for monthly plan', () => {
			const instance = new CartItem( props );
			isMonthly.mockImplementation( () => true );
			isYearly.mockImplementation( () => false );
			isBiennially.mockImplementation( () => false );
			expect( instance.getSubscriptionLength() ).toEqual( 'monthly subscription' );
		} );

		test( 'Returns "annual subscription" for annual plan', () => {
			const instance = new CartItem( props );
			isMonthly.mockImplementation( () => false );
			isYearly.mockImplementation( () => true );
			isBiennially.mockImplementation( () => false );
			expect( instance.getSubscriptionLength() ).toEqual( 'annual subscription' );
		} );

		test( 'Returns "two year subscription" for biennial plan', () => {
			const instance = new CartItem( props );
			isMonthly.mockImplementation( () => false );
			isYearly.mockImplementation( () => false );
			isBiennially.mockImplementation( () => true );
			expect( instance.getSubscriptionLength() ).toEqual( 'two year subscription' );
		} );

		test( 'Returns false for unknown type of plan', () => {
			const instance = new CartItem( props );
			isMonthly.mockImplementation( () => false );
			isYearly.mockImplementation( () => false );
			isBiennially.mockImplementation( () => false );
			expect( instance.getSubscriptionLength() ).toEqual( false );
		} );
	} );
} );
