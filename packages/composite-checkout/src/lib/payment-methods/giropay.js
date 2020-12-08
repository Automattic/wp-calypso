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
import { useFormStatus } from '../form-status';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';
import { PaymentMethodLogos } from '../styled-components/payment-method-logos';

const debug = debugFactory( 'composite-checkout:giropay-payment-method' );

export function createGiropayPaymentMethodStore() {
	debug( 'creating a new giropay payment method store' );
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

	const store = registerStore( 'giropay', {
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

export function createGiropayMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'giropay',
		label: <GiropayLabel />,
		activeContent: <GiropayFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		inactiveContent: <GiropaySummary />,
		submitButton: (
			<GiropayPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		getAriaLabel: ( __ ) => __( 'Giropay' ),
	};
}

function GiropayFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'giropay' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<GiropayFormWrapper>
			<GiropayField
				id="giropay-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</GiropayFormWrapper>
	);
}

const GiropayFormWrapper = styled.div`
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
			right: 3px;
			left: auto;
		}
	}
`;

const GiropayField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function GiropayPayButton( { disabled, onClick, store, stripe, stripeConfiguration } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting giropay payment' );
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'giropay' },
					} );
					onClick( 'giropay', {
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

function isFormValid( store ) {
	const customerName = store.selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		return false;
	}
	return true;
}

function GiropayLabel() {
	return (
		<React.Fragment>
			<span>Giropay</span>
			<PaymentMethodLogos className="giropay__logo payment-logos">
				<GiropayLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const GiropayLogo = styled( GiropayLogoImg )`
	width: 64px;
	margin: -10px 0;
`;

function GiropayLogoImg( { className } ) {
	return <img src="/calypso/images/upgrades/giropay.svg" alt="Giropay" className={ className } />;
}

function GiropaySummary() {
	const customerName = useSelect( ( select ) => select( 'giropay' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}
