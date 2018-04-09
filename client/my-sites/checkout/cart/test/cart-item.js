/**
 * @format
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
import { CartItem } from '../cart-item';
import { isPlan, isMonthly } from 'lib/products-values';

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
};

const props = {
	cartItem,
	translate: identity,
};

describe( 'cart-item', () => {
	test( 'Does not blow up', () => {
		const comp = shallow( <CartItem { ...props } /> );
		expect( comp.find( '.cart-item' ).length ).toBe( 1 );
	} );

	describe( 'calculates correct monthly price', () => {
		beforeEach( () => {
			isPlan.mockImplementation( () => true );
			isMonthly.mockImplementation( () => false );
		} );

		test( 'Returns null if cost is undefined', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					cost: undefined,
				},
			} );
			expect( instance.monthlyPrice() ).toBe( null );
		} );

		test( 'Returns null if cartItem is not a plan', () => {
			isPlan.mockImplementation( () => false );
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
				},
			} );
			expect( instance.monthlyPrice() ).toBe( null );
		} );

		test( 'Returns null if cost is 0', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					cost: 0,
				},
			} );
			expect( instance.monthlyPrice() ).toBe( null );
		} );

		test( 'Returns null if cost is less than 0', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					cost: -1,
				},
			} );
			expect( instance.monthlyPrice() ).toBe( null );
		} );

		test( 'Returns null if plan is a monthly plan', () => {
			isMonthly.mockImplementation( () => true );
			const instance = new CartItem( props );
			expect( instance.monthlyPrice() ).toBe( null );
		} );

		test( 'Returns string if plan is not a monthly plan', () => {
			const instance = new CartItem( props );
			expect( typeof instance.monthlyPrice() ).toBe( 'string' );
		} );
	} );
} );
