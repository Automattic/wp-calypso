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
import { TERM_1_YEAR } from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import TermPickerOpton from '../index';

describe( 'TermPickerOpton basic tests', () => {
	test( 'should have term-picker-option class', () => {
		const option = shallow(
			<TermPickerOpton term={ TERM_1_YEAR } price={ 120 } pricePerMonth={ 10 } />
		);
		assert.lengthOf( option.find( '.term-picker-option' ), 1 );
	} );
	test( 'should display save badge if savePercent is specified', () => {
		const option = shallow(
			<TermPickerOpton term={ TERM_1_YEAR } price={ 120 } pricePerMonth={ 10 } savePercent={ 65 } />
		);
		assert.equal( option.find( 'Badge' ).length, 1 );
	} );
	test( 'should say "{price} / month" if savePercent is not specified', () => {
		const option = shallow(
			<TermPickerOpton term={ TERM_1_YEAR } price={ 120 } pricePerMonth={ 10 } />
		);
		assert.equal( option.find( '.term-picker-option__side-note' ).text(), '10 / month' );
	} );
	test( 'should say "only {price} / month" if savePercent is specified', () => {
		const option = shallow(
			<TermPickerOpton term={ TERM_1_YEAR } price={ 120 } pricePerMonth={ 10 } savePercent={ 65 } />
		);
		assert.equal( option.find( '.term-picker-option__side-note' ).text(), 'only 10 / month' );
	} );
} );
