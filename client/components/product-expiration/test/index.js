/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import moment from 'moment';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ProductExpiration } from '../index';

describe( 'ProductExpiration', () => {
	it( 'should return null if not provided dates', () => {
		const wrapper = shallow( <ProductExpiration translate={ translate } /> );
		expect( wrapper.isEmptyRender() ).toEqual( true );
	} );

	it( 'should return the purchase date when refundable', () => {
		const date = moment( new Date( 2009, 10, 10 ) );
		const wrapper = shallow(
			<ProductExpiration purchaseDateMoment={ date } translate={ translate } isRefundable />
		);
		expect( wrapper.text() ).toEqual( 'Purchased on November 10, 2009' );
	} );

	it( 'should return the expiry date in past tense when date is in past', () => {
		const date = moment( new Date( 2009, 10, 10 ) );
		const wrapper = shallow(
			<ProductExpiration expiryDateMoment={ date } translate={ translate } />
		);
		expect( wrapper.text() ).toEqual( 'Expired on November 10, 2009' );
	} );

	it( 'should return the renewal date in when the date is in the future', () => {
		const date = moment( new Date( 2100, 10, 10 ) );
		const wrapper = shallow(
			<ProductExpiration expiryDateMoment={ date } translate={ translate } />
		);
		expect( wrapper.text() ).toEqual( 'Renews on November 10, 2100' );
	} );

	it( 'should return null when provided an invalid expiry date', () => {
		const date = moment( NaN );
		const wrapper = shallow(
			<ProductExpiration expiryDateMoment={ date } translate={ translate } />
		);
		expect( wrapper.isEmptyRender() ).toEqual( true );
	} );

	it( 'should return null when provided an invalid purchase date and no expiry date', () => {
		const date = moment( NaN );
		const wrapper = shallow(
			<ProductExpiration purchaseDateMoment={ date } translate={ translate } />
		);
		expect( wrapper.isEmptyRender() ).toEqual( true );
	} );
} );
