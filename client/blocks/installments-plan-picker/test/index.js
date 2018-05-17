/** @format */

const translate = x => x;

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { InstallmentsPlanPicker } from '../index';

describe( 'InstallmentsPlanPicker basic tests', () => {
	const installmentsPlans = [
		{
			value: 1,
			payment: 100,
		},
		{
			value: 5,
			payment: 20,
		},
		{
			value: 10,
			payment: 10,
		},
	];

	test( 'should have subscription-length-picker class', () => {
		const picker = shallow( <InstallmentsPlanPicker plans={ [] } translate={ translate } /> );
		expect( picker.find( '.installments-plan-picker' ).length ).toBe( 1 );
	} );

	test( 'should mark appropriate InstallmentsPlanPicker as checked', () => {
		const picker = shallow(
			<InstallmentsPlanPicker
				plans={ installmentsPlans }
				initialValue={ 10 }
				currencyCode={ 'BRL' }
				translate={ translate }
			/>
		);

		const first = picker.find( 'FormRadio' ).first();
		expect( first.props().value ).toEqual( 1 );
		expect( first.props().checked ).toEqual( false );

		const last = picker.find( 'FormRadio' ).last();
		expect( last.props().value ).toEqual( 10 );
		expect( last.props().checked ).toEqual( true );
	} );
} );
