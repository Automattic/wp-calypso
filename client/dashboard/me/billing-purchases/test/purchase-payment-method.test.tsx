/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { PurchasePaymentMethod } from '../purchase-payment-method';
import type { Purchase } from '@automattic/api-core';

function createPurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1,
		expiry_status: 'auto-renewing',
		is_iap_purchase: false,
		is_domain: false,
		is_rechargeable: true,
		partner_name: undefined,
		payment_type: 'credit_card',
		payment_card_id: '12345',
		payment_card_type: 'visa',
		payment_card_display_brand: 'Visa',
		payment_details: '4242',
		product_slug: 'jetpack_complete',
		meta: '',
		...overrides,
	} as Purchase;
}

describe( '<PurchasePaymentMethod>', () => {
	test( 'renders payment method for a normal purchase', () => {
		const purchase = createPurchase();
		render( <PurchasePaymentMethod purchase={ purchase } /> );

		expect( screen.getByText( /\*{4} \*{4} \*{4} 4242/ ) ).toBeVisible();
	} );

	test( 'returns null when site is missing for a non-domain, non-A4A purchase', () => {
		const purchase = createPurchase( { is_domain: false, meta: '' } );
		const { container } = render( <PurchasePaymentMethod purchase={ purchase } isSiteMissing /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders payment method for a siteless A4A billing dragon purchase', () => {
		const purchase = createPurchase( {
			meta: 'is-a4a',
			domain: 'siteless.a4a.com',
			is_domain: false,
		} );
		render( <PurchasePaymentMethod purchase={ purchase } isSiteMissing /> );

		expect( screen.getByText( /\*{4} \*{4} \*{4} 4242/ ) ).toBeVisible();
	} );

	test( 'renders payment method for a domain purchase even when site is missing', () => {
		const purchase = createPurchase( { is_domain: true, meta: 'example.com' } );
		render( <PurchasePaymentMethod purchase={ purchase } isSiteMissing /> );

		expect( screen.getByText( /\*{4} \*{4} \*{4} 4242/ ) ).toBeVisible();
	} );
} );
