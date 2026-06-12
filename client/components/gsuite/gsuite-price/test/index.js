/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
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
		const { container } = render( <GSuitePrice product={ product } currencyCode="EUR" /> );

		expect( container.firstChild ).toMatchSnapshot();
	} );
} );
