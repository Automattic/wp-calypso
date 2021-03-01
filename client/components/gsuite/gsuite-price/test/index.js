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
		prices: {
			USD: 72,
			AUD: 102,
			CAD: 96,
			EUR: 76,
			GBP: 65,
			JPY: 8200,
			BRL: 288,
			ILS: 264,
			INR: 5040,
			MXN: 1404,
			NZD: 104.4,
			RUB: 4680,
			SEK: 792,
			HUF: 23400,
			CHF: 72,
			CZK: 1728,
			DKK: 522,
			HKD: 576,
			NOK: 720,
			PHP: 3960,
			PLN: 288,
			SGD: 108,
			TWD: 2304,
			THB: 2520,
			TRY: 396,
		},
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
