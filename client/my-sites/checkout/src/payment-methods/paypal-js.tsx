import { PayPalConfigurationApiResponse, PayPalProvider } from '@automattic/calypso-paypal';
import {
	useTogglePaymentMethod,
	type PaymentMethod,
	type ProcessPayment,
	usePaymentMethodId,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	PayPalButtons,
	PayPalButtonsComponentProps,
	usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { PayPalLogo } from 'calypso/dashboard/components/paypal-logo';
import wp from 'calypso/lib/wp';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { PaymentMethodLogos } from '../components/payment-method-logos';
import { convertErrorToString, logStashEvent } from '../lib/analytics';

const debug = debugFactory( 'calypso:paypal-js' );

async function fetchPayPalConfiguration(): Promise< PayPalConfigurationApiResponse > {
	return await wp.req.get( '/me/paypal-configuration' );
}

export function createPayPal( {
	hasExistingPayPalPPCPMethods,
}: {
	hasExistingPayPalPPCPMethods?: boolean;
} = {} ): PaymentMethod {
	return {
		id: 'paypal-js',
		paymentProcessorId: 'paypal-js',
		label: <PayPalLabel hasExistingPayPalPPCPMethods={ hasExistingPayPalPPCPMethods } />,
		submitButton: <PayPalSubmitButtonWrapper />,
		getAriaLabel: () => 'PayPal',
		isInitiallyDisabled: true,
	};
}

function PayPalLabel( {
	hasExistingPayPalPPCPMethods,
}: {
	hasExistingPayPalPPCPMethods?: boolean;
} ) {
	const { __ } = useI18n();
	return (
		<>
			<div>
				{ hasExistingPayPalPPCPMethods ? (
					<span>{ __( 'New PayPal account' ) }</span>
				) : (
					<span>PayPal</span>
				) }
			</div>
			<PaymentMethodLogos className="paypal__logo payment-logos">
				<PayPalLogo />
			</PaymentMethodLogos>
		</>
	);
}

// Create a Promise that can be resolved from outside. This will be much easier
// in ES2024 with Promise.withResolvers but until that is widely available,
// this will work.
function deferred< T >() {
	let resolve: ( value: T | PromiseLike< T > ) => void = () => {};
	let reject: ( reason?: unknown ) => void = () => {};
	const promise = new Promise< T >( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { resolve, reject, promise };
}

function PayPalSubmitButtonWrapper( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	return (
		<PayPalProvider
			currency={ responseCart.currency }
			fetchPayPalConfiguration={ fetchPayPalConfiguration }
			handleError={ handlePayPalConfigurationError }
		>
			<PayPalSubmitButton disabled={ disabled } onClick={ onClick } />
		</PayPalProvider>
	);
}

function handlePayPalConfigurationError( error: Error ) {
	logStashEvent( convertErrorToString( error ), { tags: [ 'paypal-configuration' ] }, 'error' );
}

function PayPalSubmitButton( {
	disabled,
	onClick,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
} ) {
	const translate = useTranslate();
	const togglePaymentMethod = useTogglePaymentMethod();
	const [ forceReRender, setForceReRender ] = useState< number >( 0 );
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	// Wait for PayPal.js to load before marking this payment method as active.
	const [ { isResolved: isPayPalJsLoaded, isPending: isPayPalJsStillLoading } ] =
		usePayPalScriptReducer();
	// Sometimes it appears that usePayPalScriptReducer lies about the script
	// being loaded (or possibly the script does not correctly expose its
	// Buttons property?) and we get a fatal error when trying to render
	// PayPalButtons, so we double check before enabling the payment method.
	const arePayPalButtonsAvailable = Boolean( window?.paypal?.Buttons );
	useEffect( () => {
		if ( isPayPalJsLoaded && arePayPalButtonsAvailable ) {
			togglePaymentMethod( 'paypal-js', true );
		}
		if ( isPayPalJsLoaded && ! arePayPalButtonsAvailable ) {
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
			logStashEvent(
				'PayPal says the script is loaded but Buttons are not available',
				{
					paypal: paypalObjectString,
					tags: [ 'paypal-configuration', 'paypal-buttons-missing' ],
				},
				'error'
			);
		}
	}, [ isPayPalJsLoaded, arePayPalButtonsAvailable, togglePaymentMethod ] );

	useEffect( () => {
		debug( 'cart changed; rerendering PayPalSubmitButton' );
		// The PayPalButtons component appears to cache certain data about the
		// order process and in order to make sure it has the latest data, we
		// have to use the `forceReRender` prop.
		setForceReRender( ( val ) => val + 1 );
	}, [ responseCart ] );

	// We have to wait for the active payment method to switch because the
	// contents of the `onClick` function will change when the active state
	// changes and if we render `PayPalButtons` too soon it will keep the old
	// version of `onClick` in its closure, which will prevent the payment
	// processor function from being called.
	const [ activePaymentMethodId ] = usePaymentMethodId();
	const isActive = 'paypal-js' === activePaymentMethodId;

	if ( isPayPalJsStillLoading || ! isPayPalJsLoaded || ! arePayPalButtonsAvailable || ! isActive ) {
		return <div>Loading</div>;
	}

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; PayPalSubmitButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	const {
		promise: payPalApprovalPromise,
		resolve: resolvePayPalApprovalPromise,
		reject: rejectPayPalApprovalPromise,
	} = deferred< void >();

	const createOrder: PayPalButtonsComponentProps[ 'createOrder' ] = () => {
		debug( 'creating order' );
		// Intentionally do not resolve yet. We have to do this so we can
		// use the composite-checkout transaction system (the `onClick`
		// handler) to call the transactions endpoint and then eventually
		// return here to trigger the PayPal popup which happens when this
		// Promise resolves with the PayPal order ID.
		const { promise: orderPromise, resolve: resolvePayPalOrderPromise } = deferred< string >();
		onClick( { resolvePayPalOrderPromise, payPalApprovalPromise } );
		return orderPromise;
	};

	const onApprove: PayPalButtonsComponentProps[ 'onApprove' ] = async () => {
		debug( 'order approved' );
		// Once the user has confirmed the PayPal transaction in the popup, we
		// want to tell the composite-checkout payment processor function to
		// continue so we resolve the other Promise.
		resolvePayPalApprovalPromise();
	};

	const onCancel: PayPalButtonsComponentProps[ 'onCancel' ] = async () => {
		debug( 'order cancelled' );
		// The PayPalButtons component appears to cache certain data about the
		// order process and in order to make sure it has the latest data, we
		// have to use the `forceReRender` prop.
		setForceReRender( ( val ) => val + 1 );
		rejectPayPalApprovalPromise(
			new Error( translate( 'The PayPal transaction was not approved.' ) )
		);
	};

	// This payment method button is a little unusual. Normally, a payment
	// button will trigger the transaction system by calling the `onClick`
	// function passed to this component. That function (the "payment processor
	// function" - in this case, `payPalJsProcessor()`) will handle all
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
