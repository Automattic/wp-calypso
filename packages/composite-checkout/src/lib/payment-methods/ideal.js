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
import {
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	renderDisplayValueMarkdown,
	useEvents,
} from '../../public-api';
import { SummaryLine, SummaryDetails } from '../styled-components/summary-details';
import { useFormStatus } from '../form-status';
import { registerStore, useSelect, useDispatch } from '../../lib/registry';

const debug = debugFactory( 'composite-checkout:ideal-payment-method' );

export function createIdealPaymentMethodStore() {
	debug( 'creating a new ideal payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
		changeCustomerBank( payload ) {
			return { type: 'CUSTOMER_BANK_SET', payload };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
		getCustomerBank( state ) {
			return state.customerBank || '';
		},
	};

	const store = registerStore( 'ideal', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
				customerBank: { value: '', isTouched: false },
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
				case 'CUSTOMER_BANK_SET':
					return { ...state, customerBank: { value: action.payload, isTouched: true } };
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createIdealMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'ideal',
		label: <IdealLabel />,
		activeContent: <IdealFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<IdealPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <IdealSummary />,
		getAriaLabel: ( __ ) => __( 'iDEAL' ),
	};
}

function IdealFields() {
	const { __ } = useI18n();

	const customerName = useSelect( ( select ) => select( 'ideal' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ideal' ).getCustomerBank() );
	const { changeCustomerName, changeCustomerBank } = useDispatch( 'ideal' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';

	return (
		<IdealFormWrapper>
			<IdealField
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
			<BankSelector
				id="bank-selector"
				value={ customerBank?.value ?? '' }
				onChange={ changeCustomerBank }
				label={ __( 'Bank' ) }
				isError={ customerBank?.isTouched && customerBank?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
		</IdealFormWrapper>
	);
}

function BankSelector( { id, value, onChange, label, isError, errorMessage, disabled } ) {
	const { __ } = useI18n();
	const bankOptions = getBankOptions( __ );
	/* eslint-disable jsx-a11y/no-onchange */
	return (
		<SelectWrapper>
			<label htmlFor={ id } disabled={ disabled }>
				{ label }
			</label>
			<select
				id={ id }
				value={ value }
				onChange={ ( event ) => onChange( event.target.value ) }
				disabled={ disabled }
			>
				{ bankOptions.map( ( bank ) => (
					<BankOption key={ bank.value } value={ bank.value } label={ bank.label } />
				) ) }
			</select>
			<ErrorMessage isError={ isError } errorMessage={ errorMessage } />
		</SelectWrapper>
	);
	/* eslint-enable jsx-a11y/no-onchange */
}

function BankOption( { value, label } ) {
	return <option value={ value }>{ label }</option>;
}

function ErrorMessage( { isError, errorMessage } ) {
	if ( isError ) {
		return <Description isError={ isError }>{ errorMessage }</Description>;
	}
	return null;
}

const Description = styled.p`
	margin: 8px 0 0 0;
	color: ${ ( props ) =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight };
	font-style: italic;
	font-size: 14px;
`;

const IdealFormWrapper = styled.div`
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
	}
`;

const IdealField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

const SelectWrapper = styled.div`
	margin-top: 16px;

	select {
		width: 100%;
	}
`;

function IdealPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'ideal' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'ideal' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ideal' ).getCustomerBank() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting ideal payment' );
					setTransactionPending();
					onEvent( { type: 'IDEAL_TRANSACTION_BEGIN' } );
					submitTransaction( {
						stripe,
						name: customerName?.value,
						idealBank: customerBank?.value,
						items,
						total,
						stripeConfiguration,
					} )
						.then( ( stripeResponse ) => {
							if ( ! stripeResponse?.redirect_url ) {
								setTransactionError(
									__(
										'There was an error processing your payment. Please try again or contact support.'
									)
								);
								return;
							}
							debug( 'ideal transaction requires redirect', stripeResponse.redirect_url );
							setTransactionRedirecting( stripeResponse.redirect_url );
						} )
						.catch( ( error ) => {
							setTransactionError( error.message );
						} );
				}
			} }
			buttonType="primary"
			isBusy={ 'submitting' === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } total={ total } />
		</Button>
	);
}

function ButtonContents( { formStatus, total } ) {
	const { __ } = useI18n();
	if ( formStatus === 'submitting' ) {
		return __( 'Processing…' );
	}
	if ( formStatus === 'ready' ) {
		return sprintf( __( 'Pay %s' ), renderDisplayValueMarkdown( total.amount.displayValue ) );
	}
	return __( 'Please wait…' );
}

function IdealSummary() {
	const customerName = useSelect( ( select ) => select( 'ideal' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ideal' ).getCustomerBank() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
			<SummaryLine>{ customerBank?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store ) {
	const customerName = store.selectors.getCustomerName( store.getState() );
	const customerBank = store.selectors.getCustomerBank( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
	}
	if ( ! customerBank?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerBank( '' ) );
	}
	if ( ! customerName?.value.length || ! customerBank?.value.length ) {
		return false;
	}
	return true;
}

function IdealLabel() {
	const { __ } = useI18n();
	// TODO: add icon
	return (
		<React.Fragment>
			<span>{ __( 'iDEAL' ) }</span>
		</React.Fragment>
	);
}

function getBankOptions( __ ) {
	// Source https://stripe.com/docs/sources/ideal
	const banks = [
		{ value: 'abn_amro', label: 'ABN AMRO' },
		{ value: 'asn_bank', label: 'ASN Bank' },
		{ value: 'bunq', label: 'Bunq' },
		{ value: 'ing', label: 'ING' },
		{ value: 'knab', label: 'Knab' },
		{ value: 'rabobank', label: 'Rabobank' },
		{ value: 'regiobank', label: 'RegioBank' },
		{ value: 'sns_bank', label: 'SNS Bank' },
		{ value: 'triodos_bank', label: 'Triodos Bank' },
		{ value: 'van_lanschot', label: 'Van Lanschot' },
	];
	return [ { value: '', label: __( 'Please select your bank.' ) }, ...banks ];
}
