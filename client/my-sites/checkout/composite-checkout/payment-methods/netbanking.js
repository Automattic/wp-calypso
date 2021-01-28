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
	useFormStatus,
	registerStore,
	useSelect,
	useDispatch,
} from '@automattic/composite-checkout';
import { camelCase } from 'lodash';
import { useDispatch as useReduxDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { errorNotice } from 'calypso/state/notices/actions';
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

const debug = debugFactory( 'composite-checkout:netbanking-payment-method' );

export function createNetBankingPaymentMethodStore() {
	debug( 'creating a new netbanking payment method store' );
	const actions = {
		changeCustomerName( payload ) {
			return { type: 'CUSTOMER_NAME_SET', payload };
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
		getFields( state ) {
			return state.fields;
		},
	};

	const store = registerStore( 'netbanking', {
		reducer(
			state = {
				customerName: { value: '', isTouched: false },
				fields: {},
			},
			action
		) {
			switch ( action.type ) {
				case 'CUSTOMER_NAME_SET':
					return { ...state, customerName: { value: action.payload, isTouched: true } };
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

export function createNetBankingMethod( { store } ) {
	return {
		id: 'netbanking',
		label: <NetBankingLabel />,
		activeContent: <NetBankingFields />,
		submitButton: <NetBankingPayButton store={ store } />,
		inactiveContent: <NetBankingSummary />,
		getAriaLabel: () => 'Transferência bancária',
	};
}

function NetBankingFields() {
	const { __ } = useI18n();

	const fields = useSelect( ( select ) => select( 'netbanking' ).getFields() );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );
		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ __( 'This field is required.' ) ];
		}
		return managedValue.errors ?? [];
	};
	const { setFieldValue } = useDispatch( 'netbanking' );

	const customerName = useSelect( ( select ) => select( 'netbanking' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'netbanking' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList( [] );

	return (
		<NetBankingFormWrapper>
			<NetBankingField
				id="netbanking-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<div className="netbanking__contact-fields">
				<CountrySpecificPaymentFields
					countryCode={ 'IN' } // If this payment method is available and the country is not India, we have other problems
					countriesList={ countriesList }
					getErrorMessage={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ setFieldValue }
					disableFields={ isDisabled }
				/>
			</div>
		</NetBankingFormWrapper>
	);
}

const NetBankingFormWrapper = styled.div`
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

const NetBankingField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function NetBankingPayButton( { disabled, onClick, store } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'netbanking' ).getCustomerName() );
	const fields = useSelect( ( select ) => select( 'netbanking' ).getFields() );
	const massagedFields = Object.entries( fields ).reduce(
		( accum, [ key, managedValue ] ) => ( { ...accum, [ camelCase( key ) ]: managedValue.value } ),
		{}
	);
	const contactCountryCode = useSelect(
		( select ) => select( 'wpcom' )?.getContactInfo().countryCode?.value
	);
	const reduxDispatch = useReduxDispatch();

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store, contactCountryCode, __, reduxDispatch ) ) {
					debug( 'submitting netbanking payment' );
					onClick( 'netbanking', {
						...massagedFields,
						name: customerName?.value,
						address: massagedFields?.address1,
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
		/* translators: %s is the total to be paid in localized currency */
		return sprintf( __( 'Pay %s' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function NetBankingSummary() {
	const customerName = useSelect( ( select ) => select( 'netbanking' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store, contactCountryCode, __, reduxDispatch ) {
	// Touch fields so that we show errors
	store.dispatch( store.actions.touchAllFields() );
	let isValid = true;

	const customerName = store.selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.changeCustomerName( '' ) );
		isValid = false;
	}

	const rawState = store.selectors.getFields( store.getState() );

	const validationResults = validatePaymentDetails(
		Object.entries( {
			...rawState,
			country: { value: contactCountryCode },
			name: customerName,
		} ).reduce( ( accum, [ key, managedValue ] ) => {
			accum[ key ] = managedValue.value;
			return accum;
		}, {} ),
		'netbanking'
	);

	Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
		errors.map( ( error ) => {
			isValid = false;
			store.dispatch( store.actions.setFieldError( key, error ) );
		} );
	} );
	debug( 'netbanking card details validation results: ', validationResults );

	if ( validationResults.errors?.country?.length > 0 ) {
		const countryErrorMessage = validationResults.errors.country[ 0 ];
		reduxDispatch(
			errorNotice( countryErrorMessage || __( 'An error occurred during your purchase.' ) )
		);
	}
	return isValid;
}

function NetBankingLabel() {
	return (
		<React.Fragment>
			<span>Net Banking</span>
			<PaymentMethodLogos className="netbanking__logo payment-logos">
				<NetbankingLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const NetbankingLogo = styled( NetbankingLogoImg )`
	width: 76px;
`;

function NetbankingLogoImg( { className } ) {
	return (
		<img src="/calypso/images/upgrades/netbanking.svg" alt="NetBanking" className={ className } />
	);
}
