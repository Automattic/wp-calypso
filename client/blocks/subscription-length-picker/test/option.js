/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

const translate = x => x;
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
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { TERM_1_YEAR } from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { SubscriptionLengthOption } from '../option';

describe( 'TermPickerOpton basic tests', () => {
	test( 'should have term-picker-picker__option class', () => {
		const option = shallow(
			<SubscriptionLengthOption
				term={ TERM_1_YEAR }
				price={ 120 }
				pricePerMonth={ 10 }
				translate={ translate }
			/>
		);
		expect( option.find( '.subscription-length-picker__option' ).length ).toBe( 1 );
	} );
	test( 'should display save badge if savePercent is specified', () => {
		const option = shallow(
			<SubscriptionLengthOption
				term={ TERM_1_YEAR }
				price={ 120 }
				pricePerMonth={ 10 }
				savePercent={ 65 }
				translate={ translate }
			/>
		);
		expect( option.find( 'Badge' ).length ).toBe( 1 );
	} );
	test( 'should say "{price} / month" if savePercent is not specified', () => {
		const option = shallow(
			<SubscriptionLengthOption
				term={ TERM_1_YEAR }
				price={ 120 }
				pricePerMonth={ 10 }
				translate={ translate }
			/>
		);
		expect( option.find( '.subscription-length-picker__option-side-note' ).text() ).toEqual(
			'%(price)s / month'
		);
	} );
	test( 'should say "only {price} / month" if savePercent is specified', () => {
		const option = shallow(
			<SubscriptionLengthOption
				term={ TERM_1_YEAR }
				price={ 120 }
				pricePerMonth={ 10 }
				savePercent={ 65 }
				translate={ translate }
			/>
		);
		expect( option.find( '.subscription-length-picker__option-side-note' ).text() ).toEqual(
			'only %(price)s / month'
		);
	} );
} );
