import { Button, FormStatus, useTotal, useFormStatus } from '@automattic/composite-checkout';
import { Field } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useSelect, useDispatch, registerStore } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { camelCase } from 'lodash';
import { Fragment } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { maskField } from 'calypso/lib/checkout';
import { validatePaymentDetails } from 'calypso/lib/checkout/validation';
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import { errorNotice } from 'calypso/state/notices/actions';
import { CountrySpecificPaymentFields } from '../components/country-specific-payment-fields';
import type { PaymentMethod, ProcessPayment, LineItem } from '@automattic/composite-checkout';
import type {
	StoreSelectors,
	StoreSelectorsWithState,
	StoreStateValue,
} from '@automattic/wpcom-checkout';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'composite-checkout:netbanking-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

type StoreKey = 'netbanking';
type NounsInStore = 'customerName';
type FieldsType = Record< string, StoreStateValue >;
type NetBankingStoreState< N extends string > = Record< N, StoreStateValue > & {
	fields: FieldsType;
};

interface NetBankingPaymentMethodStore< N extends string >
	extends ReturnType< typeof registerStore > {
	getState: () => NetBankingStoreState< N >;
}
type NetBankingStore = NetBankingPaymentMethodStore< NounsInStore >;

declare module '@wordpress/data' {
	function select(
		key: StoreKey
	): StoreSelectors< NounsInStore > & { getFields: () => FieldsType };
	function dispatch( key: StoreKey ): typeof actions;
}

const actions = {
	changeCustomerName( payload: string ) {
		return { type: 'CUSTOMER_NAME_SET', payload };
	},
	setFieldValue( key: string, value: string ) {
		return { type: 'FIELD_VALUE_SET', payload: { key, value } };
	},
	setFieldError( key: string, message: string ) {
		return { type: 'FIELD_ERROR_SET', payload: { key, message } };
	},
	touchAllFields() {
		return { type: 'TOUCH_ALL_FIELDS' };
	},
};

const selectors: StoreSelectorsWithState< NounsInStore > & {
	getFields: ( state: NetBankingStoreState< NounsInStore > ) => FieldsType;
} = {
	getCustomerName( state ) {
		return state.customerName;
	},
	getFields( state ) {
		return state.fields;
	},
};

export function createNetBankingPaymentMethodStore(): NetBankingStore {
	debug( 'creating a new netbanking payment method store' );
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
									state.fields[ action.payload.key ]?.value,
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
	return store;
}

export function createNetBankingMethod( { store }: { store: NetBankingStore } ): PaymentMethod {
	return {
		id: 'netbanking',
		paymentProcessorId: 'netbanking',
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
	const getField = ( key: string ) => fields[ key ] || {};
	const getFieldValue = ( key: string ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key: string ) => {
		const managedValue = getField( key );
		return managedValue.errors ?? [];
	};
	const { setFieldValue } = useDispatch( 'netbanking' );

	const customerName = useSelect( ( select ) => select( 'netbanking' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'netbanking' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList();

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
					getErrorMessages={ getErrorMessagesForField }
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

function NetBankingPayButton( {
	disabled,
	onClick,
	store,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: NetBankingStore;
} ) {
	const { __ } = useI18n();
	const total = useTotal();
	const { formStatus } = useFormStatus();
	const customerName = useSelect( ( select ) => select( 'netbanking' ).getCustomerName() );
	const fields = useSelect( ( select ) => select( 'netbanking' ).getFields() );
	const massagedFields: typeof fields = Object.entries( fields ).reduce(
		( accum, [ key, managedValue ] ) => ( { ...accum, [ camelCase( key ) ]: managedValue.value } ),
		{}
	);
	const contactCountryCode = 'IN'; // If this payment method is available and the country is not India, we have other problems
	const reduxDispatch = useReduxDispatch();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; NetBankingPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				if ( isFormValid( store, contactCountryCode, __, reduxDispatch ) ) {
					debug( 'submitting netbanking payment' );
					onClick( {
						...massagedFields,
						name: customerName?.value,
						address: massagedFields?.address1,
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

function ButtonContents( { formStatus, total }: { formStatus: FormStatus; total: LineItem } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		/* translators: %s is the total to be paid in localized currency */
		return <>{ sprintf( __( 'Pay %s' ), total.amount.displayValue ) }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function NetBankingSummary() {
	const customerName = useSelect( ( select ) => select( 'netbanking' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid(
	store: NetBankingStore,
	contactCountryCode: string,
	__: ( text: string ) => string,
	reduxDispatch: CalypsoDispatch
) {
	// Touch fields so that we show errors
	store.dispatch( actions.touchAllFields() );
	let isValid = true;

	const customerName = selectors.getCustomerName( store.getState() );

	if ( ! customerName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( actions.changeCustomerName( '' ) );
		isValid = false;
	}

	const rawState = selectors.getFields( store.getState() );

	const validationResults = validatePaymentDetails(
		Object.entries( {
			...rawState,
			country: { value: contactCountryCode },
			name: customerName,
		} ).reduce( ( accum: Record< string, string >, [ key, managedValue ] ) => {
			accum[ key ] = managedValue.value;
			return accum;
		}, {} ),
		'netbanking'
	);

	Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
		errors.map( ( error ) => {
			isValid = false;
			store.dispatch( actions.setFieldError( key, error ) );
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
		<Fragment>
			<span>Net Banking</span>
			<PaymentMethodLogos className="netbanking__logo payment-logos">
				<NetBankingLogo />
			</PaymentMethodLogos>
		</Fragment>
	);
}

const NetBankingLogo = styled( NetBankingLogoImg )`
	width: 76px;
`;

function NetBankingLogoImg( { className }: { className?: string } ) {
	return (
		<img src="/calypso/images/upgrades/netbanking.svg" alt="NetBanking" className={ className } />
	);
}
