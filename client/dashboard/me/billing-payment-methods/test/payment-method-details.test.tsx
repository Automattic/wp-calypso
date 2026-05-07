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

	test( 'renders UPI label and VPA from display_meta for a retired Razorpay payment method', () => {
		// Regression fixture: after wpcom Razorpay PR 2 swaps the engine class
		// for Retired_Stored_Payment_Method, the row arrives with `retired: true`
		// and `razorpay_vpa` nested under `display_meta`. The display site must
		// render the same UI as for live rows.
		const method = {
			payment_partner: 'razorpay',
			retired: true,
			display_meta: { razorpay_vpa: 'user@okaxis' },
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'Unified Payments Interface (UPI)' ) ).toBeVisible();
		expect( screen.getByText( 'user@okaxis' ) ).toBeVisible();
	} );

	test( 'renders the saved name for a retired non-Razorpay payment method', () => {
		// Generic retire-tolerance: any partner can be retired in the future,
		// after which its rows arrive without partner-specific top-level
		// fields. Without this catchall, the dashboard would render a blank
		// cell. The user's saved `name` (always present on the base) keeps
		// the row identifiable.
		const method = {
			payment_partner: 'ebanx',
			retired: true,
			name: 'My Brazilian card',
			display_meta: {},
		} as unknown as StoredPaymentMethod;

		render( <PaymentMethodDetails paymentMethod={ method } /> );

		expect( screen.getByText( 'My Brazilian card' ) ).toBeVisible();
	} );

	test( 'falls back to a generic label when a retired method has no saved name', () => {
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
