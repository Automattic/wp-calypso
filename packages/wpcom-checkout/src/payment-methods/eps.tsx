import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useState, Fragment, ReactNode } from 'react';
import Field from '../field';
import { PaymentMethodLogos } from '../payment-method-logos';
import { SummaryLine, SummaryDetails } from '../summary-details';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:eps-payment-method' );

interface EpsPaymentMethodStateShape {
	customerName: string;
}

type StateSubscriber = () => void;

class EpsPaymentMethodState {
	data: EpsPaymentMethodStateShape = {
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

export function createEpsMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	const state = new EpsPaymentMethodState();

	return {
		id: 'eps',
		hasRequiredFields: true,
		paymentProcessorId: 'eps',
		label: <EpsLabel />,
		activeContent: <EpsFields state={ state } />,
		submitButton: <EpsPayButton state={ state } submitButtonContent={ submitButtonContent } />,
		inactiveContent: <EpsSummary state={ state } />,
		getAriaLabel: ( __ ) => __( 'EPS' ),
	};
}

function useSubscribeToEventEmitter( state: EpsPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
}

const EpsFormWrapper = styled.div`
	padding: 16px;
	position: relative;

	:after {
		display: block;
		width: calc( 100% - 6px );
		height: 1px;
		content: '';
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		position: absolute;
		top: 0;
		left: 3px;

		.rtl & {
			left: auto;
			right: 3px;
		}
	}
`;

const EpsField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function EpsFields( { state }: { state: EpsPaymentMethodState } ) {
	const { __ } = useI18n();
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<EpsFormWrapper>
			<EpsField
				id="cardholderName"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ state.data.customerName }
				onChange={ state.change }
				isError={ state.isTouched && state.data.customerName.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</EpsFormWrapper>
	);
}

function EpsPayButton( {
	disabled,
	onClick,
	state,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	state: EpsPaymentMethodState;
	submitButtonContent: ReactNode;
} ) {
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; EpsPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( state ) ) {
					debug( 'submitting eps payment' );
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

function EpsSummary( { state }: { state: EpsPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );

	return (
		<SummaryDetails>
			<SummaryLine>{ state.data.customerName }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( state: EpsPaymentMethodState ): boolean {
	if ( ! state.data.customerName.length ) {
		// Touch the field so it displays a validation error
		state.change( '' );
		return false;
	}

	return true;
}

function EpsLogoImg( { className }: { className?: string } ) {
	return <img src="/calypso/images/upgrades/eps.svg" alt="EPS" className={ className } />;
}

const EpsLogo = styled( EpsLogoImg )`
	width: 28px;
`;

function EpsLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'EPS' ) }</span>
			<PaymentMethodLogos className="eps__logo payment-logos">
				<EpsLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}
