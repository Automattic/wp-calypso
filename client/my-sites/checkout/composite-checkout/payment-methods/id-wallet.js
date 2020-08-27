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
import { camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { validatePaymentDetails } from 'lib/checkout/validation';
import useCountryList from 'my-sites/checkout/composite-checkout/hooks/use-country-list';
import Field from 'my-sites/checkout/composite-checkout/components/field';
import {
	SummaryLine,
	SummaryDetails,
} from 'my-sites/checkout/composite-checkout/components/summary-details';
import { PaymentMethodLogos } from 'my-sites/checkout/composite-checkout/components/payment-method-logos';
import { maskField } from 'lib/checkout';
import CountrySpecificPaymentFieldsUI from '../components/country-specific-payment-fields-ui';

const debug = debugFactory( 'composite-checkout:id-wallet-payment-method' );

export function createIdWalletPaymentMethodStore() {
	debug( 'creating a new id wallet payment method store' );
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

	const store = registerStore( 'id-wallet', {
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

export function createIdWalletMethod( { store, stripe, stripeConfiguration } ) {
	return {
		id: 'id-wallet',
		label: <IdWalletLabel />,
		activeContent: <IdWalletFields stripe={ stripe } stripeConfiguration={ stripeConfiguration } />,
		submitButton: (
			<IdWalletPayButton
				store={ store }
				stripe={ stripe }
				stripeConfiguration={ stripeConfiguration }
			/>
		),
		inactiveContent: <IdWalletSummary />,
		getAriaLabel: () => 'OVO',
	};
}

function IdWalletFields() {
	const { __ } = useI18n();

	const fields = useSelect( ( select ) => select( 'id-wallet' ).getFields() );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );
		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ __( 'This field is required.' ) ];
		}
		return managedValue.errors ?? [];
	};
	const { setFieldValue } = useDispatch( 'id-wallet' );

	const customerName = useSelect( ( select ) => select( 'id-wallet' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'id-wallet' );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== 'ready';
	const countriesList = useCountryList( [] );

	return (
		<IdWalletFormWrapper>
			<IdWalletField
				id="id-wallet-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ customerName?.value ?? '' }
				onChange={ changeCustomerName }
				isError={ customerName?.isTouched && customerName?.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<div className="id-wallet__contact-fields">
				<CountrySpecificPaymentFieldsUI
					countryCode={ 'ID' } // If this payment method is available and the country is not India, we have other problems
					countriesList={ countriesList }
					getErrorMessage={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ setFieldValue }
					disableFields={ isDisabled }
				/>
			</div>
		</IdWalletFormWrapper>
	);
}

const IdWalletFormWrapper = styled.div`
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

const IdWalletField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function IdWalletPayButton( { disabled, store } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const {
		setTransactionRedirecting,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	const submitTransaction = usePaymentProcessor( 'id-wallet' );
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'id-wallet' ).getCustomerName() );
	const fields = useSelect( ( select ) => select( 'id-wallet' ).getFields() );
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
					debug( 'submitting id wallet payment' );
					setTransactionPending();
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'id-wallet' },
					} );
					submitTransaction( {
						...massagedFields,
						name: customerName?.value,
						address: massagedFields?.address1,
						items,
						total,
					} )
						.then( ( transactionResponse ) => {
							if ( ! transactionResponse?.redirect_url ) {
								setTransactionError(
									__(
										'There was an error processing your payment. Please try again or contact support.'
									)
								);
								return;
							}
							debug( 'id wallet transaction requires redirect', transactionResponse.redirect_url );
							setTransactionRedirecting( transactionResponse.redirect_url );
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

function IdWalletSummary() {
	const customerName = useSelect( ( select ) => select( 'id-wallet' ).getCustomerName() );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName?.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid( store, contactCountryCode, __ ) {
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
		'id-wallet'
	);

	Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
		errors.map( ( error ) => {
			isValid = false;
			store.dispatch( store.actions.setFieldError( key, error ) );
		} );
	} );
	debug( 'id wallet card details validation results: ', validationResults );

	if ( validationResults.errors?.country?.length > 0 ) {
		const countryErrorMessage = validationResults.errors.country[ 0 ];
		notices.error( countryErrorMessage || __( 'An error occurred during your purchase.' ) );
	}
	return isValid;
}

function IdWalletLabel() {
	return (
		<React.Fragment>
			<span>OVO</span>
			<PaymentMethodLogos className="id-wallet__logo payment-logos">
				<IdWalletLogoUI />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const IdWalletLogoUI = styled( IdWalletLogo )`
	width: 76px;
`;

function IdWalletLogo( { className } ) {
	return <img src="/calypso/images/upgrades/ovo.svg" alt="OVO" className={ className } />;
}
