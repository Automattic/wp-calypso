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
	FormStatus,
	useLineItems,
	useEvents,
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';
import { camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import { validatePaymentDetails } from 'calypso/lib/checkout/validation';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import Field from 'calypso/my-sites/checkout/composite-checkout/components/field';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-logos';
import { maskField } from 'calypso/lib/checkout';
import CountrySpecificPaymentFields from '../components/country-specific-payment-fields';

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
			return state.customerName;
		},
		getCustomerBank( state ) {
			return state.customerBank;
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
						fields: {
							...state.fields,
							[ action.payload.key ]: {
								value: maskField(
									action.payload.key,
									state.fields[ action.payload.key ],
									action.payload.value
								),
								isTouched: true,
								errors: [],
							},
						},
					};
				case 'FIELD_ERROR_SET':
					return {
						...state,
						fields: {
							...state.fields,
							[ action.payload.key ]: {
								...state.fields[ action.payload.key ],
								errors: [ action.payload.message ],
							},
						},
					};
				case 'TOUCH_ALL_FIELDS':
					return {
						...state,
						fields: Object.keys( state.fields ).reduce(
							( obj, key ) => ( {
								...obj,
								[ key ]: {
									...state.fields[ key ],
									isTouched: true,
								},
							} ),
							{}
						),
					};
			}
			return state;
		},
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

export function createEbanxTefMethod( { store } ) {
	return {
		id: 'brazil-tef',
		label: <EbanxTefLabel />,
		activeContent: <EbanxTefFields />,
		submitButton: <EbanxTefPayButton store={ store } />,
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
	const isDisabled = formStatus !== FormStatus.READY;
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
			<div className="ebanx-tef__contact-fields">
				<CountrySpecificPaymentFields
					countryCode={ 'BR' } // If this payment method is available and the country is not Brazil, we have other problems
					countriesList={ countriesList }
					getErrorMessage={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ setFieldValue }
					disableFields={ isDisabled }
				/>
			</div>
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

function EbanxTefPayButton( { disabled, onClick, store } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerName() );
	const customerBank = useSelect( ( select ) => select( 'ebanx-tef' ).getCustomerBank() );
	const fields = useSelect( ( select ) => select( 'ebanx-tef' ).getFields() );
	const massagedFields = Object.entries( fields ).reduce(
		( accum, [ key, managedValue ] ) => ( { ...accum, [ camelCase( key ) ]: managedValue.value } ),
		{}
	);
	const contactCountryCode = useSelect(
		( select ) => select( 'wpcom' )?.getContactInfo().countryCode?.value
	);

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store, contactCountryCode, __ ) ) {
					debug( 'submitting ebanx-tef payment' );
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'ebanx-tef' },
					} );
					onClick( 'ebanx-tef', {
						...massagedFields,
						name: customerName?.value, // this needs to come after massagedFields to prevent it from being overridden
						address: massagedFields?.address1,
						tefBank: customerBank?.value,
						items,
						total,
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

function isFormValid( store, contactCountryCode, __ ) {
	// Touch fields so that we show errors
	store.dispatch( store.actions.touchAllFields() );
	let isValid = true;

	const customerName = store.selectors.getCustomerName( store.getState() );
	const customerBank = store.selectors.getCustomerBank( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		isValid = false;
	}
	if ( ! customerBank?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerBank( '' ) );
		isValid = false;
	}

	const rawState = store.selectors.getFields( store.getState() );

	const validationResults = validatePaymentDetails(
		Object.entries( {
			...rawState,
			country: { value: contactCountryCode },
			name: customerName,
			'tef-bank': customerBank,
		} ).reduce( ( accum, [ key, managedValue ] ) => {
			accum[ key ] = managedValue.value;
			return accum;
		}, {} ),
		'brazil-tef'
	);

	Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
		errors.map( ( error ) => {
			isValid = false;
			store.dispatch( store.actions.setFieldError( key, error ) );
		} );
	} );
	debug( 'ebanx card details validation results: ', validationResults );

	if ( validationResults.errors?.country?.length > 0 ) {
		const countryErrorMessage = validationResults.errors.country[ 0 ];
		notices.error( countryErrorMessage || __( 'An error occurred during your purchase.' ) );
	}
	return isValid;
}

function EbanxTefLabel() {
	return (
		<React.Fragment>
			<span>{ 'Transferência bancária' }</span>
			<PaymentMethodLogos className="ebanx-tef__logo payment-logos">
				<EbanxTefLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const EbanxTefLogo = styled( EbanxTefLogoImg )`
	width: 76px;
`;

function EbanxTefLogoImg( { className } ) {
	return (
		<img
			src="/calypso/images/upgrades/brazil-tef.svg"
			alt="Transferência bancária"
			className={ className }
		/>
	);
}

function getBankOptions( __ ) {
	const banks = [
		{ value: 'banrisul', label: 'Banrisul' },
		{ value: 'bradesco', label: 'Bradesco' },
		{ value: 'bancodobrasil', label: 'Banco do Brasil' },
		{ value: 'itau', label: 'Itaú' },
	];
	return [ { value: '', label: __( 'Please select your bank.' ) }, ...banks ];
}
