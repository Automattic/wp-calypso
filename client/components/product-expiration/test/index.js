/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { ProductExpiration } from '../index';

describe( 'ProductExpiration', () => {
	it( 'should return null if not provided dates', () => {
		const { container } = render( <ProductExpiration translate={ translate } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should return the purchase date when refundable', () => {
		const date = moment( new Date( 2009, 10, 10 ) );
		const { container } = render(
			<ProductExpiration purchaseDateMoment={ date } translate={ translate } isRefundable />
		);
		expect( container ).toHaveTextContent( 'Purchased on November 10, 2009' );
	} );

	it( 'should return the expiry date in past tense when date is in past', () => {
		const date = moment( new Date( 2009, 10, 10 ) );
		const { container } = render(
			<ProductExpiration expiryDateMoment={ date } translate={ translate } />
		);
		expect( container ).toHaveTextContent( 'Expired on November 10, 2009' );
	} );

	it( 'should return the expiry date in future tense when date is in future', () => {
		const date = moment( new Date( 2100, 10, 10 ) );
		const { container } = render(
			<ProductExpiration expiryDateMoment={ date } translate={ translate } />
		);
		expect( container ).toHaveTextContent( 'Expires on November 10, 2100' );
	} );

	it( 'should return the renewal date (same as the expiry date) in when the date is in the future', () => {
		const date = moment( new Date( 2100, 10, 10 ) );
		const { container } = render(
			<ProductExpiration
				expiryDateMoment={ date }
				renewDateMoment={ date }
				translate={ translate }
			/>
		);
		expect( container ).toHaveTextContent( 'Renews on November 10, 2100' );
	} );

	it( 'should return the renewal date in when the date is in the future', () => {
		const expiryDate = moment( new Date( 2100, 9, 10 ) );
		const renewDate = moment( new Date( 2100, 10, 10 ) );
		const { container } = render(
			<ProductExpiration
				expiryDateMoment={ expiryDate }
				renewDateMoment={ renewDate }
				translate={ translate }
			/>
		);
		expect( container ).toHaveTextContent( 'Renews on November 10, 2100' );
	} );

	it( 'should return null when provided an invalid expiry date', () => {
		const date = moment( NaN );
		const { container } = render(
			<ProductExpiration expiryDateMoment={ date } translate={ translate } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should return null when provided an invalid purchase date and no expiry date', () => {
		const date = moment( NaN );
		const { container } = render(
			<ProductExpiration purchaseDateMoment={ date } translate={ translate } />
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );
