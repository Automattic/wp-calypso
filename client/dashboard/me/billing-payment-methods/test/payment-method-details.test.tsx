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

	test( 'renders display_meta label and detail for a retired payment method', () => {
		// Once wpcom emits a retired row, `display_meta.label` + `display_meta.detail`
		// carry the rendered strings. Any retired partner uses the same code path.
		const method = {
			payment_partner: 'razorpay',
			retired: true,
			display_meta: { label: 'UPI Payment Method', detail: 'user@okaxis' },
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'UPI Payment Method' ) ).toBeVisible();
		expect( screen.getByText( 'user@okaxis' ) ).toBeVisible();
	} );

	test( 'renders only display_meta label when detail is absent', () => {
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			display_meta: { label: 'Retired processor' },
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'Retired processor' ) ).toBeVisible();
	} );

	test( 'falls back to saved name for a retired method with no display_meta strings', () => {
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			name: 'My Brazilian card',
			display_meta: {},
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'My Brazilian card' ) ).toBeVisible();
	} );

	test( 'falls back to a generic label when a retired method has neither display_meta nor name', () => {
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			name: '',
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
