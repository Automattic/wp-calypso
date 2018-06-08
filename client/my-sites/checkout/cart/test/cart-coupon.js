/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { mount, shallow } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { CartCoupon } from '../cart-coupon';
import { applyCoupon, removeCoupon } from 'lib/upgrades/actions';

jest.mock( 'lib/upgrades/actions', () => ( {
	applyCoupon: jest.fn( () => {} ),
	removeCoupon: jest.fn( () => {} ),
} ) );

jest.mock( 'lib/analytics', () => ( {
	ga: {
		recordEvent: () => {},
	},
	tracks: {
		recordEvent: () => {},
	},
} ) );

const props = {
	translate: identity,
};

const event = {
	preventDefault: identity,
	stopPropagation: identity,
};

describe( 'cart-coupon', () => {
	const cart = {
		is_coupon_applied: false,
		coupon: '',
	};

	describe( 'General behavior', () => {
		test( 'Should not blow up', () => {
			const component = shallow( <CartCoupon { ...props } cart={ cart } /> );
			expect( component.find( '.cart__coupon' ).length ).toBe( 1 );
		} );

		test( 'Should render only coupon code link when there is no coupon', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: false,
						coupon: '',
					} }
				/>
			);
			expect( component.find( '.cart__toggle-link' ).length ).toBe( 1 );
			expect( component.find( '.cart__form' ).length ).toBe( 0 );
		} );

		test( 'Should show coupon form when toggle link is clicked', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: false,
						coupon: '',
					} }
				/>
			);
			component.find( '.cart__toggle-link' ).simulate( 'click', event );
			expect( component.find( '.cart__toggle-link' ).length ).toBe( 1 );
			expect( component.find( '.cart__form' ).length ).toBe( 1 );
		} );

		test( 'Should hide coupon form when toggle link is clicked twice', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: false,
						coupon: '',
					} }
				/>
			);
			component.find( '.cart__toggle-link' ).simulate( 'click', event );
			component.find( '.cart__toggle-link' ).simulate( 'click', event );
			expect( component.find( '.cart__toggle-link' ).length ).toBe( 1 );
			expect( component.find( '.cart__form' ).length ).toBe( 0 );
		} );

		test( 'Should apply a coupon when form is submitted', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: false,
						coupon: '',
					} }
				/>
			);
			applyCoupon.mockReset();
			component.find( '.cart__toggle-link' ).simulate( 'click', event );
			component.setState( {
				couponInputValue: 'CODE15',
			} );
			component.find( '.cart__form' ).simulate( 'submit', event );
			expect( applyCoupon.mock.calls.length ).toBe( 1 );
			expect( applyCoupon.mock.calls[ 0 ][ 0 ] ).toBe( 'CODE15' );
		} );

		test( 'Should disallow submission when form is currently being submitted', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: false,
						coupon: '',
					} }
				/>
			);
			applyCoupon.mockReset();
			component.find( '.cart__toggle-link' ).simulate( 'click', event );
			component.setState( {
				couponInputValue: 'CODE15',
			} );
			component.find( '.cart__form' ).simulate( 'submit', event );
			component.setProps( {
				cart: {
					...cart,
					is_coupon_applied: false,
					coupon: 'CODE15',
				},
			} );
			component.find( '.cart__form' ).simulate( 'submit', event );
			expect( applyCoupon.mock.calls.length ).toBe( 1 );
		} );

		test( 'Should show coupon details when there is a coupon', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: true,
						coupon: 'TEST10',
					} }
				/>
			);
			expect( component.find( '.cart__toggle-link' ).length ).toBe( 0 );
			expect( component.find( '.cart__form' ).length ).toBe( 0 );
			expect( component.find( '.cart__details' ).length ).toBe( 1 );
			expect( component.find( '.cart__remove-link' ).length ).toBe( 1 );
		} );

		test( 'Should remove a coupon when "remove" link is clicked', () => {
			const component = shallow(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						is_coupon_applied: true,
						coupon: 'TEST10',
					} }
				/>
			);
			removeCoupon.mockReset();
			component.find( '.cart__remove-link' ).simulate( 'click', event );
			expect( removeCoupon.mock.calls.length ).toBe( 1 );
			expect( removeCoupon.mock.calls[ 0 ][ 0 ] ).toBe( undefined );
		} );

		test( 'Should not display coupon form if cart total is 0', () => {
			const component = mount(
				<CartCoupon
					{ ...props }
					cart={ {
						...cart,
						total_cost: 0,
					} }
				/>
			);
			applyCoupon.mockReset();
			expect( component.children().length ).toBe( 0 );
			expect( component.find( 'cart__coupon' ).length ).toBe( 0 );
		} );
	} );

	describe( 'isSubmitting', () => {
		test( 'Should return true if cart suggests the form is being submitted', () => {
			const component = new CartCoupon( {
				...props,
				cart: {
					...cart,
					is_coupon_applied: false,
					coupon: 'TEST10',
				},
			} );
			expect( component.isSubmitting ).toBe( true );
		} );

		test( 'Should return false if there is no coupon in cart', () => {
			const component = new CartCoupon( {
				...props,
				cart: {
					...cart,
					is_coupon_applied: false,
					coupon: '',
				},
			} );
			expect( component.isSubmitting ).toBe( false );
		} );

		test( 'Should return false if coupon is applied', () => {
			const component = new CartCoupon( {
				...props,
				cart: {
					...cart,
					is_coupon_applied: true,
					coupon: '',
				},
			} );
			expect( component.isSubmitting ).toBe( false );
		} );
	} );

	describe( 'appliedCouponCode', () => {
		test( 'Should return coupon code from cart when that code is applied', () => {
			const component = new CartCoupon( {
				...props,
				cart: {
					...cart,
					is_coupon_applied: true,
					coupon: 'TEST10',
				},
			} );
			expect( component.appliedCouponCode ).toBe( 'TEST10' );
		} );

		test( 'Should return null when that no code is applied', () => {
			const component = new CartCoupon( {
				...props,
				cart: {
					...cart,
					is_coupon_applied: false,
					coupon: 'TEST10',
				},
			} );
			expect( component.appliedCouponCode ).toBe( null );
		} );

		test( 'Should return null when coupon code is empty', () => {
			const component = new CartCoupon( {
				...props,
				cart: {
					...cart,
					is_coupon_applied: true,
					coupon: '',
				},
			} );
			expect( component.appliedCouponCode ).toBe( null );
		} );
	} );
} );
