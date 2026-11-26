/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { PurchasePaymentMethod } from '../purchase-payment-method';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		user_id: 1,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		site_slug: 'example.com',
		is_rechargeable: false,
		subscription_status: 'active',
		expiry_status: 'manual-renew',
		expiry_date: '2027-01-01',
		...overrides,
	} as Purchase;
}

describe( 'PurchasePaymentMethod', () => {
	test( 'a renewable purchase without a payment method links to add one', () => {
		render( <PurchasePaymentMethod purchase={ makePurchase() } /> );

		expect( screen.getByRole( 'link', { name: 'Add payment method' } ) ).toBeVisible();
	} );

	test( 'a one-time purchase does not ask for a payment method', () => {
		render(
			<PurchasePaymentMethod purchase={ makePurchase( { expiry_status: 'one-time-purchase' } ) } />
		);

		expect( screen.queryByRole( 'link', { name: 'Add payment method' } ) ).not.toBeInTheDocument();
	} );
} );
