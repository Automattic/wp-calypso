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
import { FormStatus, useLineItems } from '../../public-api';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';
import { PaymentMethodLogos } from '../styled-components/payment-method-logos';

const debug = debugFactory( 'composite-checkout:sofort-payment-method' );

export function createSofortPaymentMethodStore() {
	debug( 'creating a new sofort payment method store' );
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

	const store = registerStore( 'sofort', {
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

export function createSofortMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'sofort',
		label: <SofortLabel />,
		activeContent: <SofortFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<SofortPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <SofortSummary />,
		getAriaLabel: ( __ ) => __( 'Sofort' ),
	};
}

function SofortFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'sofort' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'sofort' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<SofortFormWrapper>
			<SofortField
				id="sofort-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</SofortFormWrapper>
	);
}

const SofortFormWrapper = styled.div`
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

const SofortField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function SofortPayButton( { disabled, onClick, store, stripe, stripeConfiguration } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'sofort' ).getCustomerName() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting sofort payment' );
					onClick( 'sofort', {
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
		/* translators: %s is the total to be paid in localized currency */
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function SofortSummary() {
	const customerName = useSelect( ( select ) => select( 'sofort' ).getCustomerName() );

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

function SofortLabel() {
	const { __ } = useI18n();
	return (
		<React.Fragment>
			<span>{ __( 'Sofort' ) }</span>
			<PaymentMethodLogos className="sofort__logo payment-logos">
				<SofortLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const SofortLogo = styled( SofortLogoImg )`
	width: 64px;
`;

function SofortLogoImg( { className } ) {
	return <img src="/calypso/images/upgrades/sofort.svg" alt="Sofort" className={ className } />;
}
