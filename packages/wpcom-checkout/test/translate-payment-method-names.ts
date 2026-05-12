import {
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	readWPCOMPaymentMethodClass,
	readCheckoutPaymentMethodSlug,
	isRedirectPaymentMethod,
} from '../src';

describe( 'translate-payment-method-names', () => {
	describe( 'EPS', () => {
		test( 'maps WPCOM_Billing_Stripe_Eps to the eps slug', () => {
			expect(
				translateWpcomPaymentMethodToCheckoutPaymentMethod( 'WPCOM_Billing_Stripe_Eps' )
			).toStrictEqual( 'eps' );
		} );

		test( 'maps the eps slug to WPCOM_Billing_Stripe_Eps', () => {
			expect( translateCheckoutPaymentMethodToWpcomPaymentMethod( 'eps' ) ).toStrictEqual(
				'WPCOM_Billing_Stripe_Eps'
			);
		} );

		test( 'recognises WPCOM_Billing_Stripe_Eps as a valid WPCOM payment method class', () => {
			expect( readWPCOMPaymentMethodClass( 'WPCOM_Billing_Stripe_Eps' ) ).toStrictEqual(
				'WPCOM_Billing_Stripe_Eps'
			);
		} );

		test( 'recognises eps as a valid checkout payment method slug', () => {
			expect( readCheckoutPaymentMethodSlug( 'eps' ) ).toStrictEqual( 'eps' );
		} );

		test( 'classifies eps as a redirect payment method', () => {
			expect( isRedirectPaymentMethod( 'eps' ) ).toBe( true );
		} );
	} );
} );
