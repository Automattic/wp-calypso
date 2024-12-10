import { PayPalProvider } from '@automattic/calypso-paypal';
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
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { PaymentMethodLogos } from '../components/payment-method-logos';

const debug = debugFactory( 'calypso:paypal-js' );

export function createPayPal(): PaymentMethod {
	return {
		id: 'paypal-js',
		paymentProcessorId: 'paypal-js',
		label: <PayPalLabel />,
		submitButton: <PayPalSubmitButtonWrapper />,
		getAriaLabel: () => 'PayPal',
		isInitiallyDisabled: true,
	};
}

function PayPalLabel() {
	return (
		<>
			<div>
				<span>PayPal (A8C-only)</span>
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
		<PayPalProvider currency={ responseCart.currency }>
			<PayPalSubmitButton disabled={ disabled } onClick={ onClick } />
		</PayPalProvider>
	);
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
	const [ { isResolved, isPending } ] = usePayPalScriptReducer();
	useEffect( () => {
		if ( isResolved ) {
			togglePaymentMethod( 'paypal-js', true );
		}
	}, [ isResolved, togglePaymentMethod ] );

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

	if ( isPending || ! isResolved || ! isActive ) {
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

function PayPalLogo( { className }: { className?: string } ) {
	return (
		<svg
			className={ className }
			width="65"
			height="16"
			viewBox="0 0 65 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<g clipPath="url(#clip0)">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M5.61593 3.67905H10.0138C12.375 3.67905 13.2639 4.87733 13.1265 6.63776C12.8995 9.54414 11.1467 11.1521 8.82178 11.1521H7.64797C7.32897 11.1521 7.11442 11.3637 7.02814 11.9373L6.52978 15.2715C6.49686 15.4877 6.38334 15.6129 6.21306 15.63H3.44994C3.18997 15.63 3.09802 15.4308 3.16613 14.9996L4.8508 4.31062C4.91664 3.88275 5.15049 3.67905 5.61593 3.67905Z"
					fill="#009EE3"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M24.7091 3.48105C26.1929 3.48105 27.5619 4.28787 27.3746 6.29866C27.1476 8.68839 25.8705 10.0107 23.8554 10.0164H22.0947C21.8416 10.0164 21.719 10.2235 21.6531 10.648L21.3126 12.8181C21.2615 13.1458 21.0935 13.3074 20.846 13.3074H19.2079C18.9468 13.3074 18.8559 13.1401 18.9138 12.7657L20.2659 4.06824C20.3329 3.64036 20.4929 3.48105 20.7847 3.48105H24.7057H24.7091ZM22.0414 8.13761H23.3752C24.2096 8.10575 24.7636 7.52653 24.8192 6.48187C24.8533 5.83664 24.4185 5.37463 23.7272 5.37804L22.4716 5.38373L22.0414 8.13761ZM31.8281 12.6417C31.9779 12.5051 32.13 12.4346 32.1085 12.603L32.0551 13.0058C32.0279 13.2164 32.1107 13.3279 32.306 13.3279H33.7613C34.0065 13.3279 34.1257 13.2289 34.1859 12.8488L35.0827 7.20676C35.1281 6.9234 35.0589 6.78457 34.8443 6.78457H33.2437C33.0995 6.78457 33.0291 6.86537 32.9917 7.08613L32.9326 7.43321C32.902 7.61415 32.8191 7.64601 32.7419 7.46394C32.4706 6.81985 31.7781 6.5308 30.812 6.55356C28.5677 6.60022 27.0545 8.30831 26.8921 10.4978C26.7673 12.1911 27.9774 13.5213 29.5735 13.5213C30.7314 13.5213 31.2491 13.18 31.8326 12.6451L31.8281 12.6417ZM30.6088 11.7734C29.6428 11.7734 28.9696 11.0007 29.1092 10.054C29.2489 9.10717 30.1525 8.33448 31.1186 8.33448C32.0846 8.33448 32.7578 9.10717 32.6182 10.054C32.4785 11.0007 31.576 11.7734 30.6088 11.7734ZM37.931 6.76636H36.4552C36.151 6.76636 36.0272 6.99396 36.1237 7.2739L37.956 12.6519L36.1589 15.2112C36.0079 15.4252 36.1249 15.6198 36.3371 15.6198H37.9957C38.0924 15.631 38.1902 15.6141 38.2776 15.5711C38.3649 15.5281 38.4381 15.4609 38.4884 15.3774L44.1236 7.27503C44.2973 7.02582 44.2156 6.76409 43.9306 6.76409H42.3606C42.0916 6.76409 41.9837 6.87106 41.8293 7.09524L39.4794 10.5091L38.4294 7.08727C38.3681 6.88016 38.2148 6.76636 37.9321 6.76636H37.931Z"
					fill="#113984"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M49.9859 3.48107C51.4696 3.48107 52.8387 4.28789 52.6514 6.29868C52.4243 8.68841 51.1472 10.0107 49.1322 10.0164H47.3726C47.1195 10.0164 46.9969 10.2235 46.931 10.648L46.5904 12.8181C46.5394 13.1458 46.3714 13.3074 46.1239 13.3074H44.4858C44.2247 13.3074 44.1338 13.1401 44.1917 12.7658L45.546 4.06598C45.613 3.63811 45.7731 3.47879 46.0648 3.47879H49.9859V3.48107ZM47.3181 8.13763H48.652C49.4864 8.10577 50.0404 7.52655 50.096 6.48189C50.1301 5.83666 49.6953 5.37465 49.0039 5.37806L47.7484 5.38375L47.3181 8.13763V8.13763ZM57.1048 12.6417C57.2547 12.5052 57.4068 12.4346 57.3852 12.603L57.3319 13.0059C57.3046 13.2164 57.3875 13.3279 57.5827 13.3279H59.0381C59.2833 13.3279 59.4025 13.2289 59.4627 12.8488L60.3595 7.20678C60.4049 6.92342 60.3356 6.78459 60.1211 6.78459H58.5227C58.3785 6.78459 58.3081 6.86539 58.2707 7.08615L58.2117 7.43323C58.181 7.61417 58.0981 7.64603 58.0209 7.46396C57.7496 6.81987 57.0571 6.53082 56.0911 6.55358C53.8467 6.60024 52.3335 8.30833 52.1712 10.4978C52.0463 12.1911 53.2564 13.5214 54.8525 13.5214C56.0105 13.5214 56.5281 13.18 57.1116 12.6451L57.1048 12.6417ZM55.8867 11.7734C54.9207 11.7734 54.2475 11.0008 54.3871 10.054C54.5267 9.10719 55.4304 8.3345 56.3964 8.3345C57.3625 8.3345 58.0357 9.10719 57.8961 10.054C57.7564 11.0008 56.8528 11.7734 55.8867 11.7734ZM62.5993 13.337H60.9191C60.8899 13.3383 60.8608 13.3331 60.8338 13.3219C60.8068 13.3106 60.7826 13.2934 60.763 13.2717C60.7433 13.25 60.7287 13.2241 60.7202 13.1961C60.7117 13.168 60.7095 13.1384 60.7137 13.1094L62.1894 3.73711C62.2035 3.67315 62.2388 3.61584 62.2895 3.57452C62.3402 3.5332 62.4034 3.51029 62.4687 3.50952H64.1488C64.1781 3.50821 64.2072 3.51338 64.2342 3.52467C64.2612 3.53596 64.2854 3.55309 64.305 3.57483C64.3246 3.59658 64.3392 3.6224 64.3478 3.65045C64.3563 3.6785 64.3585 3.70809 64.3543 3.73711L62.8785 13.1094C62.8649 13.1738 62.8298 13.2316 62.7791 13.2734C62.7283 13.3152 62.6649 13.3384 62.5993 13.3393V13.337Z"
					fill="#009EE3"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M2.86577 0H7.26814C8.50779 0 9.97904 0.0398289 10.9621 0.910375C11.6194 1.49188 11.9645 2.41705 11.8851 3.41391C11.6149 6.78343 9.60442 8.67132 6.90714 8.67132H4.7366C4.36652 8.67132 4.12245 8.91712 4.01801 9.58169L3.41181 13.4508C3.37207 13.7011 3.26423 13.8491 3.07124 13.8673H0.354668C0.0538358 13.8673 -0.0528756 13.6397 0.0254544 13.1367L1.97803 0.735127C2.05636 0.236696 2.32995 0 2.86577 0Z"
					fill="#113984"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M4.08112 9.1891L4.84966 4.31063C4.91664 3.88276 5.15049 3.67792 5.61593 3.67792H10.0138C10.7414 3.67792 11.3306 3.79172 11.7915 4.00224C11.3499 7.00192 9.41436 8.66791 6.88056 8.66791H4.71343C4.42282 8.66905 4.2094 8.81471 4.08112 9.1891Z"
					fill="#172C70"
				/>
			</g>
			<defs>
				<clipPath id="clip0">
					<rect width="64.3588" height="15.63" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}
