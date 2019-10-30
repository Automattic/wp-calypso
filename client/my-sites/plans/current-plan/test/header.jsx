/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'blocks/dismissible-card', () => {} );
jest.mock( 'components/search', () => 'Search' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'my-sites/checkout/cart/cart-item', () => 'CartItem' );
jest.mock( 'my-sites/checkout/cart/cart-coupon', () => 'CartCoupon' );
jest.mock( 'my-sites/checkout/checkout-thank-you/google-voucher', () => 'GoogleVoucher' );
jest.mock( 'lib/user', () => () => ( {} ) );
jest.mock( 'lib/cart/store/cart-analytics', () => ( {} ) );
jest.mock( 'lib/mixins/analytics', () => () => {} );

jest.mock( 'i18n-calypso', () => ( {
	localize: Comp => props => (
		<Comp
			{ ...props }
			translate={ function( x ) {
				return x;
			} }
		/>
	),
	numberFormat: x => x,
	translate: x => x,
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { CurrentPlanHeader } from '../header';

const props = {
	selectedSite: {
		jetpack: false,
	},
	translate: () => {},
};

describe( 'CurrentPlanHeader basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <CurrentPlanHeader { ...props } /> );
		expect( comp.find( '.current-plan__header' ).length ).toBe( 1 );
	} );
} );
