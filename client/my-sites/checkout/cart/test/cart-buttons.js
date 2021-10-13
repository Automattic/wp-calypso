/**
 * @jest-environment jsdom
 */

import { mount } from 'enzyme';
import page from 'page';
import { CartButtons } from '../cart-buttons';

jest.mock( 'page', () => jest.fn() );

describe( 'cart-buttons', () => {
	describe( 'Click on Checkout Button', () => {
		test( 'should track "checkoutButtonClick" event', () => {
			const selectedSite = { slug: 'example.com' };
			const recordGoogleEvent = jest.fn();

			const cartButtonsComponent = mount(
				<CartButtons
					selectedSite={ selectedSite }
					recordGoogleEvent={ recordGoogleEvent }
					translate={ ( string ) => string }
				/>
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
