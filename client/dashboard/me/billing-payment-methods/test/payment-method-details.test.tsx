/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { PaymentMethodDetails } from '../payment-method-details';
import type { StoredPaymentMethod } from '@automattic/api-core';

describe( '<PaymentMethodDetails>', () => {
	test( 'renders card type and last four digits for a card payment method', () => {
		const method = {
			payment_partner: 'stripe',
			card_type: 'visa',
			card_last_4: '4242',
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'VISA' ) ).toBeVisible();
		expect( screen.getByText( '****4242' ) ).toBeVisible();
	} );

	test( 'renders email for a PayPal payment method', () => {
		const method = {
			payment_partner: 'paypal_express',
			email: 'user@example.com',
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'user@example.com' ) ).toBeVisible();
	} );

	test( 'renders UPI label and VPA for a live Razorpay payment method', () => {
		const method = {
			payment_partner: 'razorpay',
			razorpay_vpa: 'user@okaxis',
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'Unified Payments Interface (UPI)' ) ).toBeVisible();
		expect( screen.getByText( 'user@okaxis' ) ).toBeVisible();
	} );

	test( 'renders display_label and display_detail for a retired payment method', () => {
		// Once wpcom emits a retired row, `display_label` and `display_detail` carry
		// the rendered strings. Any retired partner uses the same code path.
		const method = {
			payment_partner: 'razorpay',
			retired: true,
			display_label: 'UPI Payment Method',
			display_detail: 'user@okaxis',
			display_meta: { razorpay_vpa: 'user@okaxis' },
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'UPI Payment Method' ) ).toBeVisible();
		expect( screen.getByText( 'user@okaxis' ) ).toBeVisible();
	} );

	test( 'renders only display_label when display_detail is null', () => {
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			display_label: 'Retired processor',
			display_detail: null,
			display_meta: {},
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'Retired processor' ) ).toBeVisible();
	} );

	test( 'falls back to saved name when display_label and display_detail are both empty', () => {
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			name: 'My Brazilian card',
			display_label: '',
			display_detail: null,
			display_meta: {},
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'My Brazilian card' ) ).toBeVisible();
	} );

	test( 'falls back to a generic label when a retired method has no label, detail, or name', () => {
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			name: '',
			display_label: '',
			display_detail: null,
			display_meta: {},
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'Saved payment method' ) ).toBeVisible();
	} );

	test( 'returns null for a non-retired method with no recognised display branch', () => {
		const method = {
			payment_partner: 'unknown',
		} as unknown as StoredPaymentMethod;

		const { container } = render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
