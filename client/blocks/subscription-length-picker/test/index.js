/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

const translate = x => x;
jest.mock( 'i18n-calypso', () => ( {
	localize: ComposedComponent => {
		const React = require( 'react' );
		const componentName = ComposedComponent.displayName || ComposedComponent.name || '';
		return class Wrapper extends React.Component {
			static displayName = componentName;

			render() {
				return (
					<ComposedComponent
						{ ...this.props }
						translate={ function( x ) {
							return x;
						} }
					/>
				);
			}
		};
	},
	numberFormat: x => x,
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
import { SubscriptionLengthPicker } from '../index';

describe( 'SubscriptionLengthPicker basic tests', () => {
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
		const picker = shallow(
			<SubscriptionLengthPicker
				productsWithPrices={ [] }
				currencyCode={ 'USD' }
				translate={ translate }
			/>
		);
		assert.lengthOf( picker.find( '.term-picker' ), 1 );
	} );

	test( 'should contain as many <SubscriptionLengthPickerOption/> as products passed', () => {
		const picker = shallow(
			<SubscriptionLengthPicker
				productsWithPrices={ productsWithPrices }
				currencyCode={ 'USD' }
				translate={ translate }
			/>
		);
		assert.lengthOf( picker.find( 'SubscriptionLengthPickerOption' ), 2 );
	} );

	test( 'should mark appropriate SubscriptionLengthPickerOption as checked', () => {
		const picker = shallow(
			<SubscriptionLengthPicker
				productsWithPrices={ productsWithPrices }
				initialValue={ PLAN_BUSINESS_2_YEARS }
				currencyCode={ 'USD' }
				translate={ translate }
			/>
		);

		const first = picker.find( 'SubscriptionLengthPickerOption' ).first();
		assert.equal( first.props().value, PLAN_BUSINESS );
		assert.equal( first.props().checked, false );

		const last = picker.find( 'SubscriptionLengthPickerOption' ).last();
		assert.equal( last.props().value, PLAN_BUSINESS_2_YEARS );
		assert.equal( last.props().checked, true );
	} );
} );
