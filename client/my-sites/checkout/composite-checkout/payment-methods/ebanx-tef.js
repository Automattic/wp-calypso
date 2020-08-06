/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import {
	Button,
	usePaymentProcessor,
	useTransactionStatus,
	useLineItems,
	useEvents,
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import useCountryList from 'my-sites/checkout/composite-checkout/wpcom/hooks/use-country-list';
import Field from 'my-sites/checkout/composite-checkout/wpcom/components/field';
import {
	SummaryLine,
	SummaryDetails,
} from 'my-sites/checkout/composite-checkout/wpcom/components/summary-details';
import { PaymentMethodLogos } from 'my-sites/checkout/composite-checkout/wpcom/components/payment-method-logos';
import CountrySpecificPaymentFields from 'my-sites/checkout/checkout/country-specific-payment-fields';

const debug = debugFactory( 'composite-checkout:ebanx-tef-payment-method' );

export function createEbanxTefPaymentMethodStore() {
	debug( 'creating a new ebanx-tef payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
		},
		changeCustomerBank( payload ) {
			return { type: 'CUSTOMER_BANK_SET', payload };
		},
		setFieldValue( key, value ) {
			return { type: 'FIELD_VALUE_SET', payload: { key, value } };
		},
		setFieldError( key, message ) {
			return { type: 'FIELD_ERROR_SET', payload: { key, message } };
		},
		touchAllFields() {
			return { type: 'TOUCH_ALL_FIELDS' };
		},
	};

	const selectors = {
		getCustomerName( state ) {
			return state.customerName || '';
		},
		getCustomerBank( state ) {
			return state.customerBank || '';
		},
		getFields( state ) {
			return state.fields;
		},
	};

	const store = registerStore( 'ebanx-tef', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
				customerBank: { value: '', isTouched: false },
				fields: {},
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
				case 'CUSTOMER_BANK_SET':
					return { ...state, customerBank: { value: action.payload, isTouched: true } };
				case 'FIELD_VALUE_SET':
					return {
						...state,
						[ action.payload.key ]: {
							value: maskField(
								action.payload.key,
								state[ action.payload.key ],
								action.payload.value
							),
							isTouched: true,
							errors: [],
						},
					};
				case 'FIELD_ERROR_SET':
					return {
						...state,
						[ action.payload.key ]: {
							...state[ action.payload.key ],
							errors: [ action.payload.message ],
						},
					};
				case 'TOUCH_ALL_FIELDS':
					return Object.entries( state ).reduce( ( obj, [ key, value ] ) => {
						obj[ key ] = {
							value: value.value,
							isTouched: true,
						};
						return obj;
					}, {} );
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createEbanxTefMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'brazil-tef',
		label: <EbanxTefLabel />,
		activeContent: <EbanxTefFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<EbanxTefPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <EbanxTefSummary />,
		getAriaLabel: () => 'Transferência bancária',
	};
}

function EbanxTefFields() {
	const { __ } = useI18n();

	const fields = useSelect( ( select ) => select( 'ebanx-tef' ).getFields() );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );
		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ __( 'This field is required.' ) ];
		}
		return managedValue.errors ?? [];
	};
	const { setFieldValue } = useDispatch( 'ebanx-tef' );

	const customerName = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerBank() );
	const { changeCustomerName, changeCustomerBank } = useDispatch( 'ebanx-tef' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';
	const countriesList = useCountryList( [] );

	return (
		<EbanxTefFormWrapper>
			<EbanxTefField
				id="ebanx-tef-cardholder-name"
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
				id="ebanx-tef-bank-selector"
				value={ customerBank?.value ?? '' }
				onChange={ changeCustomerBank }
				label={ __( 'Bank' ) }
				isError={ customerBank?.isTouched && customerBank?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<CountrySpecificPaymentFields
				countryCode={ 'BR' } // If this payment method is available and the country is not Brazil, we have other problems
				countriesList={ countriesList }
				getErrorMessage={ getErrorMessagesForField }
				getFieldValue={ getFieldValue }
				handleFieldChange={ setFieldValue }
				disableFields={ isDisabled }
			/>
		</EbanxTefFormWrapper>
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
	margin: 8px 0 0;
	color: ${ ( props ) =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight };
	font-style: italic;
	font-size: 14px;
`;

const EbanxTefFormWrapper = styled.div`
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

const EbanxTefField = styled( Field )`
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

function EbanxTefPayButton( { disabled, store, stripe, stripeConfiguration } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'ebanx-tef' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerBank() );

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store ) ) {
					debug( 'submitting ebanx-tef payment' );
					setTransactionPending();
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'ebanx-tef' },
					} );
					submitTransaction( {
						stripe,
						name: customerName?.value,
						ebanxTefBank: customerBank?.value,
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
							debug( 'ebanx-tef transaction requires redirect', stripeResponse.redirect_url );
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
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function EbanxTefSummary() {
	const customerName = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerBank() );

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

function EbanxTefLabel() {
	const { __ } = useI18n();
	return (
		<React.Fragment>
			<span>{ 'Transferência bancária' }</span>
			<PaymentMethodLogos className="ebanx-tef__logo payment-logos">
				<EbanxTefLogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const EbanxTefLogoUI = styled( EbanxTefLogo )`
	width: 28px;
`;

function EbanxTefLogo( { className } ) {
	return (
		<svg
			className={ className }
			enable-background="new 0 0 52.4 45.4"
			viewBox="0 0 52.4 45.4"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="m5.8 39.2h8.6v-13.6h-8.6zm39.1-34.8c-6.4-4.7-15.1-4.4-15.1-4.4h-29.8v45.4h29.8s9.2.6 16.1-5.1c5.6-4.7 6.5-13.2 6.5-18.1 0-4.8-1.7-13.4-7.5-17.8zm0 32.5c-5.6 5.9-14.4 5.5-14.4 5.5h-27.4v-39.3h27.4s7.5-.3 13 4.4c5.3 4.5 5.8 10.6 5.8 15 .1 4-.5 10.3-4.4 14.4zm-34.8-22.9c-2.6 0-4.6 2.1-4.6 4.6s2.1 4.6 4.6 4.6c2.6 0 4.6-2.1 4.6-4.6s-2-4.6-4.6-4.6z" />
			<path
				clip-rule="evenodd"
				d="m34.4 19.5h1.5l-.8-2zm5.9-4.8h2.1v6.5h3.8c-.2-3.4-1.5-8.4-4.8-10.9-4.3-3.4-11-3.8-11-3.8h-12.7v8.2h2.4s2.7.2 2.7 4.1c0 4-2.7 4.1-2.7 4.1h-2.4v16h12.7s7.5 0 12-4.1c2.9-2.7 3.6-8.3 3.8-11.9h-5.8v-8.2zm-9.9 1.7h-4.5v1.4h4.1v1.7h-4.1v1.7h4.5v1.7h-6.2v-8.2h6.2zm6.8 6.5-.6-1.7h-2.8l-.6 1.7h-2.2l3.1-8.2h2.1l3.4 8.2zm-16.4-4.1c0-2.2-1.4-2.4-1.4-2.4h-1.7v4.8h1.7s1.4 0 1.4-2.4z"
				fill="#cc2e74"
				fill-rule="evenodd"
			/>
		</svg>
	);
}

function getBankOptions( __ ) {
	// Source TODO
	const banks = [
		{ value: 'banrisul', label: 'Banrisul' },
		{ value: 'bradesco', label: 'Bradesco' },
		{ value: 'bancodobrasil', label: 'Banco do Brasil' },
		{ value: 'itau', label: 'Itaú' },
	];
	return [ { value: '', label: __( 'Please select your bank.' ) }, ...banks ];
}
