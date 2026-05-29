import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useState, Fragment, ReactNode } from 'react';
import Field from '../field';
import { PaymentMethodLogos } from '../payment-method-logos';
import { SummaryLine, SummaryDetails } from '../summary-details';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:ideal-payment-method' );

interface IdealPaymentMethodStateShape {
	customerName: string;
}

type StateSubscriber = () => void;

class IdealPaymentMethodState {
	data: IdealPaymentMethodStateShape = {
		customerName: '',
	};

	subscribers: StateSubscriber[] = [];

	isTouched: boolean = false;

	change = ( value: string ): void => {
		this.data.customerName = value;
		this.isTouched = true;
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

export function createIdealMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	const state = new IdealPaymentMethodState();

	return {
		id: 'ideal',
		hasRequiredFields: true,
		paymentProcessorId: 'ideal',
		label: <IdealLabel />,
		activeContent: <IdealFields state={ state } />,
		submitButton: <IdealPayButton state={ state } submitButtonContent={ submitButtonContent } />,
		inactiveContent: <IdealSummary state={ state } />,
		getAriaLabel: ( __ ) => __( 'iDEAL' ),
	};
}

function useSubscribeToEventEmitter( state: IdealPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
}

const IdealFormWrapper = styled.div`
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

const IdealField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function IdealFields( { state }: { state: IdealPaymentMethodState } ) {
	const { __ } = useI18n();
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<IdealFormWrapper>
			<IdealField
				id="ideal-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ state.data.customerName }
				onChange={ state.change }
				isError={ state.isTouched && state.data.customerName.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</IdealFormWrapper>
	);
}

function IdealPayButton( {
	disabled,
	onClick,
	state,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	state: IdealPaymentMethodState;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; IdealPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( state ) ) {
					debug( 'submitting ideal payment' );
					onClick( {
						name: state.data.customerName,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

function IdealSummary( { state }: { state: IdealPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );

	return (
		<SummaryDetails>
			<SummaryLine>{ state.data.customerName }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( state: IdealPaymentMethodState ): boolean {
	if ( ! state.data.customerName.length ) {
		// Touch the field so it displays a validation error
		state.change( '' );
		return false;
	}
	return true;
}

function IdealLogoSvg( { className }: { className?: string } ) {
	return (
		<svg
			className={ className }
			enableBackground="new 0 0 52.4 45.4"
			viewBox="0 0 52.4 45.4"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="m5.8 39.2h8.6v-13.6h-8.6zm39.1-34.8c-6.4-4.7-15.1-4.4-15.1-4.4h-29.8v45.4h29.8s9.2.6 16.1-5.1c5.6-4.7 6.5-13.2 6.5-18.1 0-4.8-1.7-13.4-7.5-17.8zm0 32.5c-5.6 5.9-14.4 5.5-14.4 5.5h-27.4v-39.3h27.4s7.5-.3 13 4.4c5.3 4.5 5.8 10.6 5.8 15 .1 4-.5 10.3-4.4 14.4zm-34.8-22.9c-2.6 0-4.6 2.1-4.6 4.6s2.1 4.6 4.6 4.6c2.6 0 4.6-2.1 4.6-4.6s-2-4.6-4.6-4.6z" />
			<path
				clipRule="evenodd"
				d="m34.4 19.5h1.5l-.8-2zm5.9-4.8h2.1v6.5h3.8c-.2-3.4-1.5-8.4-4.8-10.9-4.3-3.4-11-3.8-11-3.8h-12.7v8.2h2.4s2.7.2 2.7 4.1c0 4-2.7 4.1-2.7 4.1h-2.4v16h12.7s7.5 0 12-4.1c2.9-2.7 3.6-8.3 3.8-11.9h-5.8v-8.2zm-9.9 1.7h-4.5v1.4h4.1v1.7h-4.1v1.7h4.5v1.7h-6.2v-8.2h6.2zm6.8 6.5-.6-1.7h-2.8l-.6 1.7h-2.2l3.1-8.2h2.1l3.4 8.2zm-16.4-4.1c0-2.2-1.4-2.4-1.4-2.4h-1.7v4.8h1.7s1.4 0 1.4-2.4z"
				fill="#cc2e74"
				fillRule="evenodd"
			/>
		</svg>
	);
}

const IdealLogo = styled( IdealLogoSvg )`
	height: 20px;
	transform: translateY( -3px );
`;

function IdealLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'iDEAL' ) }</span>
			<PaymentMethodLogos className="ideal__logo payment-logos">
				<IdealLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}
