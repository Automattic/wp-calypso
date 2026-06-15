import {
	useTogglePaymentMethod,
	useRegisterPaymentMethodLoading,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useEffect, useRef, useState } from 'react';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { CartKey } from '@automattic/shopping-cart';
import type { Stripe, StripeElements, StripeExpressCheckoutElement } from '@stripe/stripe-js';

const debug = debugFactory( 'wpcom-checkout:stripe-link' );

export function createStripeLinkMethod( stripe: Stripe, cartKey: CartKey ): PaymentMethod {
	return {
		id: 'stripe-link',
		paymentProcessorId: 'stripe-link',
		label: <StripeLinkLabel />,
		submitButton: <StripeLinkSubmitButton stripe={ stripe } cartKey={ cartKey } />,
		inactiveContent: <StripeLinkSummary />,
		getAriaLabel: ( __ ) => __( 'Link by Stripe' ),
		isInitiallyDisabled: true,
	};
}

function StripeLinkLabel() {
	return <span>Link by Stripe</span>;
}

function StripeLinkSummary() {
	return <span>Link by Stripe</span>;
}

export function StripeLinkSubmitButton( {
	stripe,
	cartKey,
}: {
	stripe: Stripe;
	cartKey: CartKey;
} ) {
	const { responseCart } = useShoppingCart( cartKey );
	const amount = responseCart.total_cost_integer;
	const currency = responseCart.currency.toLowerCase();

	const togglePaymentMethod = useTogglePaymentMethod();
	const [ isReady, setIsReady ] = useState( false );

	const elementsRef = useRef< StripeElements | null >( null );
	const eceRef = useRef< StripeExpressCheckoutElement | null >( null );
	const mountTargetRef = useRef< HTMLDivElement | null >( null );

	// Mount the ECE once on first render. Uses deferred-intent mode so amount
	// can be updated without remounting. This group is separate from the
	// StripeHookProvider's Elements group (which has no mode/amount).
	useEffect( () => {
		if ( ! stripe || ! mountTargetRef.current || elementsRef.current ) {
			return;
		}

		debug( 'Creating elements group: amount=%d currency=%s', amount, currency );
		const elements = stripe.elements( { mode: 'payment', amount, currency } );
		elementsRef.current = elements;

		// paymentMethods: hide Apple Pay and Google Pay, show only Link.
		const ece = elements.create( 'expressCheckout', {
			paymentMethods: { applePay: 'auto', googlePay: 'auto', link: 'auto' },
		} );
		eceRef.current = ece;

		ece.on( 'ready', ( { availablePaymentMethods } ) => {
			// AvailablePaymentMethods in @stripe/stripe-js v4 only tracks
			// applePay/googlePay — link is not yet in the typed shape. The ECE
			// itself is the source of truth for whether Link actually renders.
			debug( '[spike] ECE ready — availablePaymentMethods=%o', availablePaymentMethods );
			setIsReady( true );
			togglePaymentMethod( 'stripe-link', true );
		} );

		ece.on( 'confirm', ( event ) => {
			debug(
				'[spike] ECE confirm — expressPaymentType=%s',
				( event as { expressPaymentType?: string } ).expressPaymentType
			);
			debug( '[spike] elements group at confirm: %o', elements );

			// Spike step 3: real processor would:
			//   1. POST to /me/transactions → clientSecret
			//   2. stripe.confirmPayment({ elements, clientSecret, confirmParams: {...} })
			//   3. poll fetchPurchaseOrder until success/error
			debug( '[spike] Would call stripe.confirmPayment({ elements, clientSecret }) here' );
			event.paymentFailed( { reason: 'fail' } );
		} );

		ece.mount( mountTargetRef.current );
		debug( 'ECE mounted' );

		return () => {
			ece.unmount();
			elementsRef.current = null;
			eceRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ stripe ] );

	// SPIKE STEP 1: Call elements.update({ amount }) on cart total changes.
	// This is the mechanism that replaces the whole-paymentRequest-rebuild
	// workaround in web-pay-utils.tsx:107. What we're validating: does the ECE
	// stay mounted and reflect the new amount, or does it remount/error?
	useEffect( () => {
		if ( ! elementsRef.current ) {
			return;
		}
		debug( '[spike] elements.update({ amount: %d })', amount );
		elementsRef.current.update( { amount } );
	}, [ amount ] );

	useRegisterPaymentMethodLoading( 'stripe-link', ! isReady );

	return <div ref={ mountTargetRef } />;
}
