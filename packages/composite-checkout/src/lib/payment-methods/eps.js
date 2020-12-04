/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Field from '../../components/field';
import Button from '../../components/button';
import { FormStatus, useLineItems, useEvents } from '../../public-api';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';
import { PaymentMethodLogos } from '../styled-components/payment-method-logos';

const debug = debugFactory( 'composite-checkout:eps-payment-method' );

export function createEpsPaymentMethodStore() {
	debug( 'creating a new eps payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
	};

	const store = registerStore( 'eps', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createEpsMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'eps',
		label: <EpsLabel />,
		activeContent: <EpsFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<EpsPayButton store={ store } stripe={ stripe } stripeConfiguration={ stripeConfiguration } />
		),
		inactiveContent: <EpsSummary />,
		getAriaLabel: ( __ ) => __( 'EPS e-Pay' ),
	};
}

function EpsFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'eps' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'eps' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<EpsFormWrapper>
			<EpsField
				id="cardholderName"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</EpsFormWrapper>
	);
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

function EpsPayButton( { disabled, onClick, store, stripe, stripeConfiguration } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'eps' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting eps payment' );
					onEvent( { type: 'REDIRECT_TRANSACTION_BEGIN', payload: { paymentMethodId: 'eps' } } );
					onClick( 'eps', {
						stripe,
						name: customerName?.value,
						items,
						total,
						stripeConfiguration,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function EpsSummary() {
	const customerName = useSelect( ( select ) => select( 'eps' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store ) {
	const customerName = store.selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		return false;
	}

	return true;
}

function EpsLabel() {
	const { __ } = useI18n();
	return (
		<React.Fragment>
			<span>{ __( 'EPS e-Pay' ) }</span>
			<PaymentMethodLogos className="eps__logo payment-logos">
				<EpsLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const EpsLogo = styled( EpsLogoImg )`
	width: 28px;
`;

function EpsLogoImg( { className } ) {
	return <img src="/calypso/images/upgrades/eps.svg" alt="EPS e-Pay" className={ className } />;
}
