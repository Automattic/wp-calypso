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
	const product = {
		product_id: 69,
		product_name: 'G Suite',
		product_slug: 'gapps',
		description: '',
		cost: 76,
		available: true,
		is_domain_registration: false,
		cost_display: '€76.00',
		currency_code: 'EUR',
	};

	test( 'renders correctly', () => {
		const tree = renderer
			.create( <GSuitePrice product={ product } currencyCode={ 'EUR' } /> )
			.toJSON();

		expect( tree ).toMatchSnapshot();
	} );
} );
