/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { getPlan } from 'lib/plans';
import { PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS } from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { TermPicker } from '../index';

describe( 'TermPicker basic tests', () => {
	const productsWithPrices = [
		{
			planSlug: PLAN_BUSINESS,
			plan: getPlan( PLAN_BUSINESS ),
			priceFull: 1200,
			priceMonthly: 100,
		},
		{
			planSlug: PLAN_BUSINESS_2_YEARS,
			plan: getPlan( PLAN_BUSINESS_2_YEARS ),
			priceFull: 1800,
			priceMonthly: 150,
		},
	];

	test( 'should have term-picker class', () => {
		const picker = shallow( <TermPicker productsWithPrices={ [] } /> );
		assert.lengthOf( picker.find( '.term-picker' ), 1 );
	} );

	test( 'should contain as many <TermPickerOption/> as products passed', () => {
		const picker = shallow( <TermPicker productsWithPrices={ productsWithPrices } /> );
		assert.lengthOf( picker.find( 'TermPickerOption' ), 2 );
	} );

	test( 'should mark appropriate TermPickerOption as checked', () => {
		const picker = shallow(
			<TermPicker
				productsWithPrices={ productsWithPrices }
				initialValue={ PLAN_BUSINESS_2_YEARS }
			/>
		);
		assert.equal(
			picker
				.find( 'TermPickerOption' )
				.first()
				.props().checked,
			false
		);
		assert.equal(
			picker
				.find( 'TermPickerOption' )
				.last()
				.props().checked,
			true
		);
	} );
} );
