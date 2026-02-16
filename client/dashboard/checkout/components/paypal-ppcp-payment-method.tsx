/**
 * PayPal PPCP payment method for Dashboard checkout.
 *
 * Uses the PayPal JS SDK embedded button flow — the user stays on the page and
 * a PayPal dialog appears for confirmation. A series of Promises coordinates
 * between the button component and the payment processor function:
 *
 * 1. PayPal SDK calls createOrder → we kick off the WPCOM transaction
 * 2. The processor resolves resolvePayPalOrderPromise with the PayPal order ID
 * 3. PayPal SDK displays the confirmation dialog
 * 4. User approves → onApprove fires → resolvePayPalApprovalPromise resolves
 * 5. The processor captures the payment via /me/paypal-ppcp-confirm-payment
 *
 * IMPORTANT: PayPalPPCPSubmitButtonWrapper must be a module-level named function
 * (not an inline closure) so that React sees a stable component type across
 * renders. If the type changes on each render, React will unmount and remount
 * the PayPalScriptProvider, closing any open PayPal popup mid-transaction.
 */
import { getPayPalConfiguration } from '@automattic/api-core';
import { PayPalProvider } from '@automattic/calypso-paypal';
import {
	useTogglePaymentMethod,
	usePaymentMethodId,
	type PaymentMethod,
	type ProcessPayment,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	PayPalButtons,
	usePayPalScriptReducer,
	type PayPalButtonsComponentProps,
} from '@paypal/react-paypal-js';
import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { PayPalLogo } from '../../components/paypal-logo';

/** Create a Promise that can be resolved or rejected from outside its executor. */
function deferred< T >() {
	let resolve: ( value: T | PromiseLike< T > ) => void = () => {};
	let reject: ( reason?: unknown ) => void = () => {};
	const promise = new Promise< T >( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { resolve, reject, promise };
}

export function createPayPalPPCPMethod( {
	currency,
	hasExistingPayPalAccounts,
	siteId = 0,
}: {
	currency?: string | null;
	hasExistingPayPalAccounts?: boolean;
	siteId?: number;
} = {} ): PaymentMethod {
	return {
		id: 'paypal-js',
		paymentProcessorId: 'paypal-js',
		label: <PayPalPPCPLabel hasExistingPayPalAccounts={ hasExistingPayPalAccounts } />,
		// Use PayPalPPCPSubmitButtonWrapper directly (a stable module-level function).
		// This prevents React from unmounting the PayPal SDK on every re-render,
		// which would close any open PayPal popup mid-transaction.
		submitButton: (
			<PayPalPPCPSubmitButtonWrapper currency={ currency ?? 'USD' } siteId={ siteId } />
		),
		getAriaLabel: () => __( 'PayPal' ),
		isInitiallyDisabled: true,
	};
}

function PayPalPPCPLabel( { hasExistingPayPalAccounts }: { hasExistingPayPalAccounts?: boolean } ) {
	return (
		<HStack justify="space-between">
			<Text>{ hasExistingPayPalAccounts ? __( 'New PayPal account' ) : 'PayPal' }</Text>
			<PayPalLogo />
		</HStack>
	);
}

function PayPalPPCPSubmitButtonWrapper( {
	disabled,
	onClick,
	currency,
	siteId = 0,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	currency: string;
	siteId?: number;
} ) {
	return (
		<PayPalProvider
			currency={ currency }
			fetchPayPalConfiguration={ getPayPalConfiguration }
			handleError={ ( error ) => {
				// eslint-disable-next-line no-console
				console.error( 'PayPal configuration error:', error );
			} }
		>
			<PayPalPPCPSubmitButton disabled={ disabled } onClick={ onClick } siteId={ siteId } />
		</PayPalProvider>
	);
}

function PayPalPPCPSubmitButton( {
	disabled,
	onClick,
	siteId = 0,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	siteId?: number;
} ) {
	const togglePaymentMethod = useTogglePaymentMethod();
	const [ forceReRender, setForceReRender ] = useState( 0 );
	const [ { isResolved: isPayPalLoaded, isPending: isPayPalLoading } ] = usePayPalScriptReducer();
	const areButtonsAvailable = Boolean( window?.paypal?.Buttons );
	const [ activeMethodId ] = usePaymentMethodId();
	const isActive = activeMethodId === 'paypal-js';
	const { responseCart } = useShoppingCart( siteId );

	// Enable this payment method once the PayPal SDK has loaded.
	useEffect( () => {
		if ( isPayPalLoaded && areButtonsAvailable ) {
			togglePaymentMethod( 'paypal-js', true );
		}
		if ( isPayPalLoaded && ! areButtonsAvailable ) {
			let paypalObjectString = '';
			try {
				paypalObjectString = JSON.stringify( window?.paypal );
			} catch ( error ) {
				paypalObjectString = `${ window?.paypal }`;
			}
			// eslint-disable-next-line no-console
			console.error(
				`PayPal says the script is loaded but Buttons are not available. The paypal object is ${ paypalObjectString }`
			);
		}
	}, [ isPayPalLoaded, areButtonsAvailable, togglePaymentMethod ] );

	// The PayPalButtons component caches certain data about the order process.
	// Re-render when the cart changes to ensure it has the latest data.
	useEffect( () => {
		setForceReRender( ( val ) => val + 1 );
	}, [ responseCart ] );

	if ( isPayPalLoading || ! isPayPalLoaded || ! areButtonsAvailable || ! isActive ) {
		return <div>{ __( 'Loading…' ) }</div>;
	}

	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; PayPalPPCPSubmitButton must be used inside CheckoutSubmitButton'
		);
	}

	const {
		promise: payPalApprovalPromise,
		resolve: resolvePayPalApprovalPromise,
		reject: rejectPayPalApprovalPromise,
	} = deferred< void >();

	// This payment method button is a little unusual. Normally, a payment
	// button will trigger the transaction system by calling the `onClick`
	// function passed to this component. That function (the "payment processor
	// function" - in this case, `payPalPPCPProcessor()`) will handle all
	// communication with the payment partner, eventually telling the
	// transaction system if the purchase succeeded or failed.
	//
	// By using PayPal JS, however, we are using their `PayPalButtons`
	// component which expects to perform the transaction itself. In order to
	// still use the transaction system in `@automattic/composite-checkout`, we
	// utilize a series of Promises to jump back and forth between the button
	// and the payment processor function.
	//
	// First, the button will call `createOrder` to create the PayPal (and the
	// WPCOM) Order. We use that to call the `onClick` function, which calls
	// the payment processor function. Since that function is async, we return
	// a Promise to `PayPalButtons` so it will wait for the Order to be
	// created. The processor function will call the transactions endpoint to
	// accomplish this.
	//
	// When we have the Order ready, the processor function will call
	// `resolvePayPalOrderPromise()` to resolve the Promise and return control
	// to `PayPalButtons`, which should display a dialog for the user to
	// confirm the payment. Meanwhile, the payment processor function will
	// pause, awaiting the `payPalApprovalPromise`.
	//
	// When the user confirms the payment, `PayPalButtons` should call
	// `onApprove`. That should call `resolvePayPalApprovalPromise()`,
	// returning control to the payment processor function, which will tell the
	// transaction system that the purchase is complete.

	const createOrder: PayPalButtonsComponentProps[ 'createOrder' ] = () => {
		// Return a Promise that resolves with the PayPal order ID. The processor
		// will resolve it once the WPCOM transaction endpoint responds.
		const { promise: orderPromise, resolve: resolvePayPalOrderPromise } = deferred< string >();
		onClick( { resolvePayPalOrderPromise, payPalApprovalPromise } );
		return orderPromise;
	};

	const onApprove: PayPalButtonsComponentProps[ 'onApprove' ] = async () => {
		// User confirmed in the PayPal dialog; unblock the processor.
		resolvePayPalApprovalPromise();
	};

	const onCancel: PayPalButtonsComponentProps[ 'onCancel' ] = async () => {
		// The PayPalButtons component caches data about the order process.
		// Force a re-render to ensure the next click gets fresh callbacks.
		setForceReRender( ( n ) => n + 1 );
		rejectPayPalApprovalPromise( new Error( __( 'The PayPal transaction was not approved.' ) ) );
	};

	return (
		<PayPalButtons
			forceReRender={ [ forceReRender ] }
			disabled={ disabled }
			style={ { layout: 'horizontal' } }
			fundingSource="paypal"
			createOrder={ createOrder }
			onApprove={ onApprove }
			onCancel={ onCancel }
		/>
	);
}
