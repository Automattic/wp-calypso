import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useId, useState, Fragment, ReactNode } from 'react';
import Field from '../field';
import { PaymentMethodLogos } from '../payment-method-logos';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:blik-payment-method' );

const BLIK_CODE_PATTERN = /^\d{6}$/;

interface BlikPaymentMethodStateShape {
	blikCode: string;
}

type BlikPaymentMethodKey = keyof BlikPaymentMethodStateShape;

type StateSubscriber = () => void;

// BLIK doesn't collect a customer name on the payment method itself: Stripe
// has no way to verify a holder name for BLIK (the bank only exposes a
// privacy-protected buyer_id, not the name), and any name needed for billing
// comes from checkout's Contact Details step.
class BlikPaymentMethodState {
	data: BlikPaymentMethodStateShape = {
		blikCode: '',
	};

	subscribers: StateSubscriber[] = [];

	isTouched: Record< BlikPaymentMethodKey, boolean > = {
		blikCode: false,
	};

	change = ( field: BlikPaymentMethodKey, value: string ): void => {
		if ( field === 'blikCode' ) {
			// BLIK codes are always 6 digits — sanitise as the user types so paste-with-spaces just works.
			value = value.replace( /\D/g, '' ).slice( 0, 6 );
		}
		this.data[ field ] = value;
		this.isTouched[ field ] = true;
		this.notifySubscribers();
	};

	subscribe = ( callback: () => void ): ( () => void ) => {
		this.subscribers.push( callback );
		return () => {
			this.subscribers = this.subscribers.filter( ( subscriber ) => subscriber !== callback );
		};
	};

	notifySubscribers = (): void => {
		this.subscribers.forEach( ( subscriber ) => subscriber() );
	};
}

export function createBlikMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	const state = new BlikPaymentMethodState();

	return {
		id: 'stripe-blik',
		hasRequiredFields: true,
		paymentProcessorId: 'stripe-blik',
		label: <BlikLabel />,
		activeContent: <BlikFields state={ state } />,
		submitButton: <BlikPayButton state={ state } submitButtonContent={ submitButtonContent } />,
		getAriaLabel: () => 'BLIK',
	};
}

function useSubscribeToEventEmitter( state: BlikPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
}

const BlikFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	::after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;

		.rtl & {
			right: 3px;
			left: auto;
		}
	}
`;

const BlikField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function BlikFields( { state }: { state: BlikPaymentMethodState } ) {
	const { __ } = useI18n();
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	let blikCodeError: string | undefined;
	if ( state.isTouched.blikCode && ! BLIK_CODE_PATTERN.test( state.data.blikCode ) ) {
		blikCodeError =
			state.data.blikCode.length === 0
				? __( 'Please enter the 6-digit BLIK code from your banking app.' )
				: __( 'BLIK code must be 6 digits.' );
	}

	return (
		<BlikFormWrapper>
			<BlikField
				id="blik-code"
				type="Text"
				autoComplete="off"
				label={ __( 'BLIK code' ) }
				description={ __(
					'Open your banking app, find the BLIK option, and enter the 6-digit code that appears here.'
				) }
				value={ state.data.blikCode }
				onChange={ ( value: string ) => state.change( 'blikCode', value ) }
				isError={ Boolean( blikCodeError ) }
				errorMessage={ blikCodeError }
				disabled={ isDisabled }
			/>
		</BlikFormWrapper>
	);
}

function BlikPayButton( {
	disabled,
	onClick,
	state,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	state: BlikPaymentMethodState;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; BlikPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Fragment>
			<Button
				disabled={ disabled }
				onClick={ () => {
					if ( isFormValid( state ) ) {
						debug( 'submitting blik payment' );
						onClick( {
							code: state.data.blikCode,
						} );
					}
				} }
				buttonType="primary"
				isBusy={ FormStatus.SUBMITTING === formStatus }
				fullWidth
			>
				{ submitButtonContent }
			</Button>
			{ /* Mount point for the BLIK waiting modal — the processor renders into this div. */ }
			<div className="blik-modal-target" />
		</Fragment>
	);
}

function isFormValid( state: BlikPaymentMethodState ): boolean {
	if ( ! BLIK_CODE_PATTERN.test( state.data.blikCode ) ) {
		// Re-emit the current value so the touched flag flips on for the error to render.
		state.change( 'blikCode', state.data.blikCode );
		return false;
	}
	return true;
}

function BlikLogo() {
	const gradientId = useId();
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="43" height="20" viewBox="0 0 43 20" fill="none">
			<path fill="#fff" d="M0 0h42.268v20H0z" />
			<path
				fill="#000"
				d="M33.12 17.15h3.183l-3.823-4.935 3.465-4.24H33.06l-3.403 4.266v-9.1h-2.47v14.008h2.47v-4.896z"
			/>
			<path fill="#fff" d="M16.136 4.654a2.21 2.21 0 1 0-4.419-.03 2.21 2.21 0 0 0 4.419.03" />
			<path
				fill="#000"
				d="M17.871 3.139h2.47v14.008h-2.47zM22.531 7.97h2.47v9.177h-2.47zM11.45 7.881a4.67 4.67 0 0 0-2.215.556V3.139h-2.47v9.422a4.684 4.684 0 1 0 4.685-4.68m0 6.937a2.253 2.253 0 1 1 0-4.506 2.253 2.253 0 0 1 0 4.505"
			/>
			<path
				fill={ `url(#${ gradientId })` }
				d="M16.136 4.654a2.21 2.21 0 1 0-4.419-.03 2.21 2.21 0 0 0 4.419.03"
			/>
			<defs>
				<linearGradient
					id={ gradientId }
					x1="12.352"
					x2="15.501"
					y1="6.189"
					y2="3.085"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#e52f08" />
					<stop offset="1" stopColor="#e94f96" />
				</linearGradient>
			</defs>
		</svg>
	);
}

function BlikLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'BLIK' ) }</span>
			<PaymentMethodLogos className="blik__logo payment-logos">
				<BlikLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}
