/**
 * @format
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
import { CartCoupon } from '../cart-coupon';
import { applyCoupon } from 'lib/upgrades/actions';

jest.mock( 'lib/upgrades/actions', () => ( {
	applyCoupon: jest.fn( () => {} ),
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
};

describe( 'cart-coupon', () => {
	const cart = {
		is_coupon_applied: false,
		coupon: '',
	};

	test( 'Should not blow up', () => {
		const component = shallow( <CartCoupon { ...props } cart={ cart } /> );
		expect( component.find( '.cart-coupon' ).length ).toBe( 1 );
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
		applyCoupon.mockReset();
		component.find( '.cart__remove-link' ).simulate( 'click', event );
		expect( applyCoupon.mock.calls.length ).toBe( 1 );
		expect( applyCoupon.mock.calls[ 0 ][ 0 ] ).toBe( '' );
	} );
} );
