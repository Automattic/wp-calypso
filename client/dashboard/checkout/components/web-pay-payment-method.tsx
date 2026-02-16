/**
 * Apple Pay and Google Pay payment methods for Dashboard checkout.
 *
 * Both methods are powered by Stripe's Payment Request API, which presents the
 * native wallet UI (Apple Pay sheet on Safari/iOS, Google Pay dialog on Chrome/
 * Android) and returns a Stripe payment-method token on success.
 *
 * Availability is detected asynchronously via `canMakePayment()`. Both methods
 * start with `isInitiallyDisabled: true` and are enabled/hidden once the check
 * resolves, so they never flash in and out of the payment method list.
 */
import {
	useTogglePaymentMethod,
	useRegisterPaymentMethodLoading,
	useFormStatus,
	FormStatus,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type MouseEvent,
} from 'react';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { PaymentRequestOptions, PaymentRequest, Stripe } from '@stripe/stripe-js';

import './web-pay-payment-method.scss';

const debug = debugFactory( 'dashboard:checkout:web-pay' );

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

/**
 * Returns a stable function reference whose body is always up-to-date.
 * Prevents Stripe PaymentRequest from being re-created on every render while
 * still allowing the onSubmit callback to close over fresh values.
 */
function useStableCallback< T extends ( ...args: never[] ) => unknown >( callback: T ): T {
	const ref = useRef( callback );
	ref.current = callback;
	// eslint-disable-next-line react-hooks/exhaustive-deps -- empty deps is intentional: we want a stable identity
	return useCallback( ( ( ...args: never[] ) => ref.current( ...args ) ) as T, [] );
}

function getProcessorCountry(
	stripeConfiguration: StripeConfiguration | null | undefined
): string {
	switch ( stripeConfiguration?.processor_id ) {
		case 'stripe_ie':
			return 'IE';
		case 'stripe_au':
			return 'AU';
		case 'stripe_ca':
			return 'CA';
		default:
			return 'US';
	}
}

// ---------------------------------------------------------------------------
// Payment request options
// ---------------------------------------------------------------------------

/**
 * Builds the Stripe PaymentRequest options object from the current cart state.
 * Re-computes only when cart total, products, or configuration changes.
 */
function useWebPaymentRequestOptions(
	stripeConfiguration: StripeConfiguration,
	siteId: number
): PaymentRequestOptions | null {
	const { responseCart } = useShoppingCart( siteId );
	const country = getProcessorCountry( stripeConfiguration );
	const { currency } = responseCart;

	return useMemo( () => {
		if ( ! currency ) {
			return null;
		}
		return {
			country,
			currency: currency.toLowerCase(),
			total: {
				label: __( 'Total' ),
				amount: responseCart.total_cost_integer,
			},
			displayItems: responseCart.products.map( ( product ) => ( {
				label: product.meta
					? `${ product.product_name } (${ product.meta })`
					: product.product_name,
				amount: product.item_subtotal_integer,
			} ) ),
			requestPayerName: true,
			requestPayerPhone: false,
			requestPayerEmail: false,
			requestShipping: false,
		};
	}, [ country, currency, responseCart.total_cost_integer, responseCart.products ] );
}

// ---------------------------------------------------------------------------
// Payment request hook
// ---------------------------------------------------------------------------

interface PaymentRequestState {
	paymentRequest: PaymentRequest | undefined | null;
	allowedPaymentTypes: {
		applePay: boolean;
		googlePay: boolean;
	};
	isLoading: boolean;
}

type SubmitPaymentData = { paymentMethodToken: string; name: string };

/**
 * Creates a Stripe PaymentRequest and detects Apple Pay / Google Pay
 * availability via canMakePayment(). Registers a paymentmethod listener that
 * calls onSubmit when the user completes the wallet flow.
 */
function useWebPaymentRequest( {
	paymentRequestOptions,
	onSubmit,
	stripe,
}: {
	paymentRequestOptions: PaymentRequestOptions | null;
	stripe: Stripe;
	onSubmit: ( data: SubmitPaymentData ) => void;
} ): PaymentRequestState {
	const [ state, setState ] = useState< PaymentRequestState >( {
		paymentRequest: undefined,
		allowedPaymentTypes: { applePay: false, googlePay: false },
		isLoading: true,
	} );

	const stableOnSubmit = useStableCallback( onSubmit );

	useEffect( () => {
		if ( ! paymentRequestOptions ) {
			return;
		}
		let isSubscribed = true;
		debug( 'creating stripe payment request', paymentRequestOptions );
		const request = stripe.paymentRequest( paymentRequestOptions );

		request
			.canMakePayment()
			.then( ( result ) => {
				if ( ! isSubscribed ) {
					return;
				}
				debug( 'canMakePayment result:', result );
				setState( ( s ) => ( {
					...s,
					allowedPaymentTypes: {
						applePay: Boolean( result?.applePay ),
						googlePay: Boolean( result?.googlePay ),
					},
					isLoading: false,
				} ) );
			} )
			.catch( () => {
				if ( ! isSubscribed ) {
					return;
				}
				setState( ( s ) => ( {
					...s,
					allowedPaymentTypes: { applePay: false, googlePay: false },
					isLoading: false,
				} ) );
			} );

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		request.on( 'paymentmethod', ( event: any ) => {
			stableOnSubmit( {
				paymentMethodToken: event.paymentMethod.id,
				name: event.payerName ?? '',
			} );
			event.complete( 'success' );
		} );

		setState( ( s ) => ( { ...s, paymentRequest: request } ) );
		return () => {
			isSubscribed = false;
		};
	}, [ stripe, paymentRequestOptions, stableOnSubmit ] );

	return state;
}

// ---------------------------------------------------------------------------
// Native payment button
// ---------------------------------------------------------------------------

function WebPayButton( {
	paymentRequest,
	paymentType,
	disabled,
}: {
	paymentRequest: PaymentRequest | undefined | null;
	paymentType: 'apple-pay' | 'google-pay';
	disabled?: boolean;
} ) {
	const { formStatus, setFormReady, setFormSubmitting } = useFormStatus();

	const handleClick = ( event: MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		setFormSubmitting();
		if ( paymentRequest ) {
			paymentRequest.on( 'cancel', setFormReady );
			paymentRequest.show();
		}
	};

	if ( formStatus === FormStatus.SUBMITTING ) {
		return (
			<button type="button" disabled className="web-pay-button web-pay-button--loading">
				{ __( 'Completing your purchase' ) }
			</button>
		);
	}

	if ( paymentType === 'apple-pay' ) {
		return (
			// The native Apple Pay button appearance is controlled entirely by WebKit
			// via the -webkit-appearance CSS property. The element itself has no
			// visible text or children.
			<button
				type="button"
				disabled={ disabled || ! paymentRequest }
				onClick={ handleClick }
				className="web-pay-button web-pay-button--apple-pay"
				aria-label={ __( 'Pay with Apple Pay' ) }
			/>
		);
	}

	if ( disabled || ! paymentRequest ) {
		return (
			<button type="button" disabled className="web-pay-button web-pay-button--disabled">
				{ __( 'Select a payment card' ) }
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={ handleClick }
			className="web-pay-button web-pay-button--google-pay"
			aria-label="Google Pay"
		>
			<GooglePayMark fill="white" />
		</button>
	);
}

// ---------------------------------------------------------------------------
// Apple Pay
// ---------------------------------------------------------------------------

export function createApplePayMethod(
	stripe: Stripe,
	stripeConfiguration: StripeConfiguration,
	siteId: number
): PaymentMethod {
	return {
		id: 'apple-pay',
		paymentProcessorId: 'apple-pay',
		label: <ApplePayLabel />,
		submitButton: (
			<ApplePaySubmitButton
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				siteId={ siteId }
			/>
		),
		inactiveContent: <Fragment>{ __( 'Apple Pay' ) }</Fragment>,
		getAriaLabel: () => __( 'Apple Pay' ),
		isInitiallyDisabled: true,
	};
}

function ApplePayLabel() {
	return (
		<Fragment>
			<span>{ __( 'Apple Pay' ) }</span>
			<span className="payment-logos">
				<ApplePayIcon />
			</span>
		</Fragment>
	);
}

function ApplePaySubmitButton( {
	disabled,
	onClick,
	stripe,
	stripeConfiguration,
	siteId,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	siteId: number;
} ) {
	const togglePaymentMethod = useTogglePaymentMethod();
	const paymentRequestOptions = useWebPaymentRequestOptions( stripeConfiguration, siteId );

	const onSubmit = useCallback(
		( { name, paymentMethodToken }: SubmitPaymentData ) => {
			if ( ! onClick ) {
				throw new Error(
					'Missing onClick prop; ApplePaySubmitButton must be used inside CheckoutFormSubmit'
				);
			}
			onClick( { stripe, paymentMethodToken, name, stripeConfiguration } );
		},
		[ onClick, stripe, stripeConfiguration ]
	);

	const { paymentRequest, allowedPaymentTypes, isLoading } = useWebPaymentRequest( {
		paymentRequestOptions,
		onSubmit,
		stripe,
	} );

	useRegisterPaymentMethodLoading( 'apple-pay', isLoading );

	useEffect( () => {
		if ( ! isLoading ) {
			togglePaymentMethod( 'apple-pay', allowedPaymentTypes.applePay );
		}
	}, [ isLoading, allowedPaymentTypes.applePay, togglePaymentMethod ] );

	if ( ! allowedPaymentTypes.applePay ) {
		return null;
	}

	return (
		<WebPayButton
			disabled={ isLoading ? true : disabled }
			paymentRequest={ paymentRequest }
			paymentType="apple-pay"
		/>
	);
}

function ApplePayIcon() {
	return (
		<svg
			width="38"
			height="16"
			viewBox="0 0 38 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M7.41541 2.16874C7.85525 1.626 8.15372 0.897268 8.075 0.152588C7.43114 0.184172 6.64544 0.571647 6.19055 1.11481C5.78212 1.57994 5.42062 2.33919 5.51486 3.05265C6.23762 3.1145 6.95971 2.69625 7.41541 2.16874Z"
				fill="black"
			/>
			<path
				d="M8.06647 3.19212C7.01685 3.13044 6.12441 3.77982 5.62317 3.77982C5.12164 3.77982 4.35406 3.2232 3.52387 3.2382C2.44331 3.25386 1.44069 3.8566 0.892353 4.81523C-0.235478 6.73296 0.594719 9.57763 1.69147 11.1395C2.22408 11.9122 2.86597 12.763 3.71175 12.7325C4.51087 12.7015 4.8241 12.222 5.79546 12.222C6.76612 12.222 7.04826 12.7325 7.89418 12.717C8.77142 12.7015 9.31985 11.9439 9.85246 11.1705C10.4635 10.2896 10.7136 9.43906 10.7293 9.39237C10.7136 9.3769 9.03775 8.74266 9.02221 6.84087C9.00639 5.24847 10.3379 4.49103 10.4006 4.44406C9.64866 3.34691 8.47379 3.2232 8.06647 3.19212Z"
				fill="black"
			/>
			<path
				d="M17.2059 1.03678C19.4872 1.03678 21.0758 2.58817 21.0758 4.84688C21.0758 7.11366 19.4545 8.67311 17.1487 8.67311H14.6228V12.6359H12.7979V1.03677H17.2059V1.03678ZM14.6228 7.16188H16.7168C18.3057 7.16188 19.21 6.31796 19.21 4.85494C19.21 3.39208 18.3057 2.55607 16.725 2.55607H14.6228V7.16188V7.16188Z"
				fill="black"
			/>
			<path
				d="M21.5527 10.2322C21.5527 8.7531 22.7016 7.84484 24.7387 7.73228L27.0851 7.59568V6.94464C27.0851 6.00413 26.4414 5.44147 25.3661 5.44147C24.3474 5.44147 23.7118 5.92367 23.5572 6.67936H21.895C21.9928 5.152 23.3126 4.02667 25.4311 4.02667C27.5088 4.02667 28.8368 5.11184 28.8368 6.80789V12.6356H27.1502V11.245H27.1096C26.6127 12.1855 25.5289 12.7803 24.4046 12.7803C22.7261 12.7803 21.5527 11.7514 21.5527 10.2322ZM27.0851 9.46864V8.80148L24.9747 8.93002C23.9237 9.00242 23.329 9.46058 23.329 10.184C23.329 10.9234 23.9482 11.4058 24.8933 11.4058C26.1236 11.4058 27.0851 10.5698 27.0851 9.46864Z"
				fill="black"
			/>
			<path
				d="M30.4291 15.7465V14.3398C30.5592 14.3719 30.8525 14.3719 30.9993 14.3719C31.814 14.3719 32.254 14.0344 32.5228 13.1663C32.5228 13.1501 32.6777 12.6518 32.6777 12.6438L29.5817 4.17947H31.488L33.6556 11.0603H33.688L35.8555 4.17947H37.7132L34.5027 13.0777C33.7697 15.1276 32.9223 15.7867 31.146 15.7867C30.9993 15.7867 30.5592 15.7706 30.4291 15.7465Z"
				fill="black"
			/>
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Google Pay
// ---------------------------------------------------------------------------

export function createGooglePayMethod(
	stripe: Stripe,
	stripeConfiguration: StripeConfiguration,
	siteId: number
): PaymentMethod {
	return {
		id: 'google-pay',
		paymentProcessorId: 'google-pay',
		label: <GooglePayLabel />,
		submitButton: (
			<GooglePaySubmitButton
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
				siteId={ siteId }
			/>
		),
		inactiveContent: <Fragment>Google Pay</Fragment>,
		getAriaLabel: () => 'Google Pay',
		isInitiallyDisabled: true,
	};
}

function GooglePayLabel() {
	return (
		<Fragment>
			<span>Google Pay</span>
			<span className="payment-logos">
				<GooglePayMark fill="#3C4043" />
			</span>
		</Fragment>
	);
}

function GooglePaySubmitButton( {
	disabled,
	onClick,
	stripe,
	stripeConfiguration,
	siteId,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	stripe: Stripe;
	stripeConfiguration: StripeConfiguration;
	siteId: number;
} ) {
	const togglePaymentMethod = useTogglePaymentMethod();
	const paymentRequestOptions = useWebPaymentRequestOptions( stripeConfiguration, siteId );

	const onSubmit = useCallback(
		( { name, paymentMethodToken }: SubmitPaymentData ) => {
			if ( ! onClick ) {
				throw new Error(
					'Missing onClick prop; GooglePaySubmitButton must be used inside CheckoutFormSubmit'
				);
			}
			onClick( { stripe, paymentMethodToken, name, stripeConfiguration } );
		},
		[ onClick, stripe, stripeConfiguration ]
	);

	const { paymentRequest, allowedPaymentTypes, isLoading } = useWebPaymentRequest( {
		paymentRequestOptions,
		onSubmit,
		stripe,
	} );

	useRegisterPaymentMethodLoading( 'google-pay', isLoading );

	useEffect( () => {
		if ( ! isLoading ) {
			togglePaymentMethod( 'google-pay', allowedPaymentTypes.googlePay );
		}
	}, [ isLoading, allowedPaymentTypes.googlePay, togglePaymentMethod ] );

	if ( ! allowedPaymentTypes.googlePay ) {
		return null;
	}

	return (
		<WebPayButton
			disabled={ isLoading ? true : disabled }
			paymentRequest={ paymentRequest }
			paymentType="google-pay"
		/>
	);
}

function GooglePayMark( { fill }: { fill: string } ) {
	return (
		<svg viewBox="0 0 524 206" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path
				d="M244.6 100.2V160.7H225.4V11.3H276.3C289.2 11.3 300.2 15.6 309.2 24.2C318.4 32.8 323 43.3 323 55.7C323 68.4 318.4 78.9 309.2 87.4C300.3 95.9 289.3 100.1 276.3 100.1H244.6V100.2ZM244.6 29.7V81.8H276.7C284.3 81.8 290.7 79.2 295.7 74.1C300.8 69 303.4 62.8 303.4 55.8C303.4 48.9 300.8 42.8 295.7 37.7C290.7 32.4 284.4 29.8 276.7 29.8H244.6V29.7Z"
				fill={ fill }
			/>
			<path
				d="M373.2 55.1C387.4 55.1 398.6 58.9 406.8 66.5C415 74.1 419.1 84.5 419.1 97.7V160.7H400.8V146.5H400C392.1 158.2 381.5 164 368.3 164C357 164 347.6 160.7 340 154C332.4 147.3 328.6 139 328.6 129C328.6 118.4 332.6 110 340.6 103.8C348.6 97.5 359.3 94.4 372.6 94.4C384 94.4 393.4 96.5 400.7 100.7V96.3C400.7 89.6 398.1 84 392.8 79.3C387.5 74.6 381.3 72.3 374.2 72.3C363.5 72.3 355 76.8 348.8 85.9L331.9 75.3C341.2 61.8 355 55.1 373.2 55.1ZM348.4 129.3C348.4 134.3 350.5 138.5 354.8 141.8C359 145.1 364 146.8 369.7 146.8C377.8 146.8 385 143.8 391.3 137.8C397.6 131.8 400.8 124.8 400.8 116.7C394.8 112 386.5 109.6 375.8 109.6C368 109.6 361.5 111.5 356.3 115.2C351 119.1 348.4 123.8 348.4 129.3Z"
				fill={ fill }
			/>
			<path
				d="M523.5 58.4L459.5 205.6H439.7L463.5 154.1L421.3 58.4H442.2L472.6 131.8H473L502.6 58.4H523.5Z"
				fill={ fill }
			/>
			<path
				d="M168.23 88C168.23 81.74 167.67 75.75 166.63 69.99H86.15V102.99L132.5 103C130.62 113.98 124.57 123.34 115.3 129.58V150.99H142.89C159 136.08 168.23 114.04 168.23 88Z"
				fill="#4285F4"
			/>
			<path
				d="M115.31 129.58C107.63 134.76 97.74 137.79 86.17 137.79C63.82 137.79 44.86 122.73 38.07 102.43H9.61V124.51C23.71 152.49 52.69 171.69 86.17 171.69C109.31 171.69 128.75 164.08 142.9 150.98L115.31 129.58Z"
				fill="#34A853"
			/>
			<path
				d="M35.39 86.05C35.39 80.35 36.34 74.84 38.07 69.66V47.58H9.61C3.78 59.15 0.500015 72.21 0.500015 86.05C0.500015 99.89 3.79 112.95 9.61 124.52L38.07 102.44C36.34 97.26 35.39 91.75 35.39 86.05Z"
				fill="#FABB05"
			/>
			<path
				d="M86.17 34.3C98.8 34.3 110.11 38.65 119.04 47.15L143.49 22.72C128.64 8.89 109.28 0.399994 86.17 0.399994C52.7 0.399994 23.71 19.6 9.61 47.58L38.07 69.66C44.86 49.36 63.82 34.3 86.17 34.3Z"
				fill="#E94235"
			/>
		</svg>
	);
}
