/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuitePrice from '../';

describe( 'GSuitePrice', () => {
	test( 'it renders GSuitePrice without monthly prices', () => {
		const tree = renderer.create( <GSuitePrice cost={ 72 } currencyCode={ 'USD' } /> ).toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePrice with monthly prices', () => {
		const tree = renderer
			.create( <GSuitePrice cost={ 144 } currencyCode={ 'USD' } /> )
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
