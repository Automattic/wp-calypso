jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

const translate = ( x ) => x;
jest.mock( '../option', () => 'SubscriptionLengthOption' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { getPlan } from 'lib/plans';
import { PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS } from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { SubscriptionLengthPicker, myFormatCurrency } from '../index';

describe( 'SubscriptionLengthPicker basic tests', () => {
	const productsWithPrices = [
		{
			planSlug: PLAN_BUSINESS,
			plan: getPlan( PLAN_BUSINESS ),
			priceFull: 1200,
			priceFinal: 1200,
			priceMonthly: 100,
		},
		{
			planSlug: PLAN_BUSINESS_2_YEARS,
			plan: getPlan( PLAN_BUSINESS_2_YEARS ),
			priceFull: 1800,
			priceFinal: 1800,
			priceMonthly: 150,
		},
	];

	test( 'should have subscription-length-picker class', () => {
		const picker = shallow(
			<SubscriptionLengthPicker
				productsWithPrices={ [] }
				currencyCode={ 'USD' }
				translate={ translate }
			/>
		);
		expect( picker.find( '.subscription-length-picker' ) ).toHaveLength( 1 );
	} );

	test( 'should contain as many <SubscriptionLengthOption/> as products passed', () => {
		const picker = shallow(
			<SubscriptionLengthPicker
				productsWithPrices={ productsWithPrices }
				currencyCode={ 'USD' }
				translate={ translate }
			/>
		);
		expect( picker.find( 'SubscriptionLengthOption' ) ).toHaveLength( 2 );
	} );

	test( 'should mark appropriate SubscriptionLengthOption as checked', () => {
		const picker = shallow(
			<SubscriptionLengthPicker
				productsWithPrices={ productsWithPrices }
				initialValue={ PLAN_BUSINESS_2_YEARS }
				currencyCode={ 'USD' }
				translate={ translate }
			/>
		);

		const first = picker.find( 'SubscriptionLengthOption' ).first();
		expect( first.props().value ).toEqual( PLAN_BUSINESS );
		expect( first.props().checked ).toEqual( false );

		const last = picker.find( 'SubscriptionLengthOption' ).last();
		expect( last.props().value ).toEqual( PLAN_BUSINESS_2_YEARS );
		expect( last.props().checked ).toEqual( true );
	} );
} );

describe( 'myFormatCurrency', () => {
	test( 'Should pass through additional options', () => {
		expect( myFormatCurrency( 1, 'USD' ) ).toBe( '$1' );
		expect( myFormatCurrency( 1, 'USD', { symbol: '' } ) ).toBe( '1' );
		expect( myFormatCurrency( 1, 'USD', { symbol: '?' } ) ).toBe( '?1' );
	} );

	describe( 'USD - precision 2', () => {
		const code = 'USD';
		const symbol = '$';
		const results = ( amount ) => myFormatCurrency( amount, code ).replace( symbol, '' );

		test( 'Should return correctly formatted amount for no cents', () => {
			expect( results( 1 ) ).toBe( '1' );
			expect( results( 9 ) ).toBe( '9' );
			expect( results( 12 ) ).toBe( '12' );
		} );
		test( 'Should return correctly formatted amount with cents', () => {
			expect( results( 0.01 ) ).toBe( '0.01' );
			expect( results( 0.02 ) ).toBe( '0.02' );
			expect( results( 0.03 ) ).toBe( '0.03' );
			expect( results( 1.11 ) ).toBe( '1.11' );
		} );
		test( 'Should return correctly formatted amount with fractions lower than cents', () => {
			expect( results( 0.001 ) ).toBe( '0' );
			expect( results( 0.002 ) ).toBe( '0' );
			expect( results( 0.003 ) ).toBe( '0' );
			expect( results( 0.009 ) ).toBe( '0' );
			expect( results( 1.0099999 ) ).toBe( '1' );
			expect( results( 1.0000000000001 ) ).toBe( '1' );
			expect( results( 1.00010000000001 ) ).toBe( '1' );
		} );
	} );
	describe( 'BHD - precision 3', () => {
		const code = 'BHD';
		const symbol = 'د.ب.‏';
		const results = ( amount ) => myFormatCurrency( amount, code ).replace( symbol, '' );

		test( 'Should return correctly formatted amount for no cents', () => {
			expect( results( 1 ) ).toBe( '1' );
			expect( results( 9 ) ).toBe( '9' );
			expect( results( 12 ) ).toBe( '12' );
		} );
		test( 'Should return correctly formatted amount with cents', () => {
			expect( results( 0.01 ) ).toBe( '0.010' );
			expect( results( 0.02 ) ).toBe( '0.020' );
			expect( results( 0.03 ) ).toBe( '0.030' );
			expect( results( 1.11 ) ).toBe( '1.110' );

			expect( results( 0.001 ) ).toBe( '0.001' );
			expect( results( 0.002 ) ).toBe( '0.002' );
			expect( results( 0.003 ) ).toBe( '0.003' );
			expect( results( 1.111 ) ).toBe( '1.111' );
		} );
		test( 'Should return correctly formatted amount with fractions lower than cents', () => {
			expect( results( 0.0001 ) ).toBe( '0' );
			expect( results( 0.0002 ) ).toBe( '0' );
			expect( results( 0.0003 ) ).toBe( '0' );
			expect( results( 0.0009 ) ).toBe( '0' );
			expect( results( 1.00099999 ) ).toBe( '1' );
		} );
	} );
} );
