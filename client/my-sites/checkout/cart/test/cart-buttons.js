/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { CartButtons } from '../cart-buttons';
import page from 'page';

jest.mock( 'page', () => jest.fn() );

describe( 'cart-buttons', () => {
	describe( 'Click on Checkout Button', () => {
		test( 'should track "checkoutButtonClick" event', () => {
			const selectedSite = { slug: 'example.com' };
			const recordGoogleEvent = jest.fn();

			const cartButtonsComponent = mount(
				<CartButtons selectedSite={ selectedSite } recordGoogleEvent={ recordGoogleEvent } />
			);
			cartButtonsComponent.find( 'button.cart-checkout-button' ).simulate( 'click' );

			expect( recordGoogleEvent ).toHaveBeenCalledWith(
				'Domain Search',
				'Click "Checkout" Button on Popup Cart'
			);
			expect( page ).toHaveBeenCalledWith( '/checkout/example.com' );
		} );
	} );
} );
