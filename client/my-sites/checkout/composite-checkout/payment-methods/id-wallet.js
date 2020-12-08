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

	const store = registerStore( 'id_wallet', {
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

export function createIdWalletMethod( { store } ) {
	return {
		id: 'id_wallet',
		label: <IdWalletLabel />,
		activeContent: <IdWalletFields />,
		submitButton: <IdWalletPayButton store={ store } />,
		inactiveContent: <IdWalletSummary />,
		getAriaLabel: () => 'OVO',
	};
}

function IdWalletFields() {
	const { __ } = useI18n();

	const fields = useSelect( ( select ) => select( 'id_wallet' ).getFields() );
	const getField = ( key ) => fields[ key ] || {};
	const getFieldValue = ( key ) => getField( key ).value ?? '';
	const getErrorMessagesForField = ( key ) => {
		const managedValue = getField( key );
		if ( managedValue?.isRequired && managedValue?.value === '' ) {
			return [ __( 'This field is required.' ) ];
		}
		return managedValue.errors ?? [];
	};
	const { setFieldValue } = useDispatch( 'id_wallet' );

	const customerName = useSelect( ( select ) => select( 'id_wallet' ).getCustomerName() );
	const { changeCustomerName } = useDispatch( 'id_wallet' );
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
				<CountrySpecificPaymentFields
					countryCode={ 'ID' }
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

function IdWalletPayButton( { disabled, onClick, store } ) {
	const { __ } = useI18n();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();
	const customerName = useSelect( ( select ) => select( 'id_wallet' ).getCustomerName() );
	const fields = useSelect( ( select ) => select( 'id_wallet' ).getFields() );
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
					onEvent( {
						type: 'REDIRECT_TRANSACTION_BEGIN',
						payload: { paymentMethodId: 'id_wallet' },
					} );
					onClick( 'id_wallet', {
						...massagedFields,
						name: customerName?.value,
						address: massagedFields?.address1,
						items,
						total,
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
	const customerName = useSelect( ( select ) => select( 'id_wallet' ).getCustomerName() );

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
		'id_wallet'
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
				<IdWalletLogo />
			</PaymentMethodLogos>
		</React.Fragment>
	);
}

const IdWalletLogo = styled( IdWalletLogoImg )`
	transform: translateY( -2px );
`;

function IdWalletLogoImg( { className } ) {
	return (
		<svg
			width="31"
			height="10"
			viewBox="0 0 31 10"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M4.91375 9.95955C2.13987 9.9584 -0.0525979 7.77195 0.000960708 4.97C0.0546625 2.1692 2.02402 -0.00335842 4.96774 0.00552028C7.97217 0.0145422 9.86792 2.43757 9.87279 5.02528C9.87752 7.66612 7.66027 10.1099 4.91375 9.95955ZM4.93666 8.27016C6.6882 8.27159 7.9779 6.91158 8.00296 5.03702C8.02717 3.21904 6.60929 1.60068 4.9474 1.67099C3.18827 1.74546 1.90086 3.02227 1.9275 5.02714C1.95327 6.96671 3.14875 8.26873 4.93666 8.27016Z"
				fill="#4D3692"
			/>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M20.444 4.9651C20.3582 2.29905 22.483 -0.0381923 25.3731 0.000473035C28.342 0.0401408 30.2737 2.23146 30.28 5.02754C30.2863 7.85254 28.0081 10.1683 24.9537 9.97097C22.5644 9.81645 20.3135 7.71091 20.444 4.9651ZM28.3468 5.00119C28.3972 2.97699 27.0087 1.70146 25.314 1.67081C23.8745 1.64475 22.7353 2.71005 22.3574 4.26912C22.023 5.64862 22.7341 7.31166 23.9309 7.94777C26.0446 9.07164 28.3479 7.53477 28.3468 5.00119Z"
				fill="#4D3692"
			/>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M10.2623 1.86375C10.2487 1.84427 10.2255 1.82594 10.2226 1.80489C10.0096 0.243957 10.0096 0.242382 11.5379 0.24453C12.3485 0.245676 13.1591 0.252263 13.9695 0.259996C14.0116 0.260426 14.0535 0.295081 14.145 0.335895C14.145 0.825799 14.145 1.33675 14.145 1.89926C13.8819 1.9216 13.6294 1.94294 13.2863 1.97187C14.0072 3.68474 14.7146 5.36539 15.4746 7.17092C16.215 5.3485 16.8961 3.67243 17.5908 1.96299C17.2855 1.9458 17.0484 1.93249 16.7388 1.91516C16.7388 1.38802 16.7388 0.862029 16.7388 0.289353C17.7646 0.289353 18.7755 0.289353 19.9091 0.289353C19.8458 0.719254 19.8651 1.13484 19.7205 1.48196C18.6194 4.12223 17.4564 6.73701 16.3827 9.38802C16.0948 10.0987 15.6387 10.1026 15.1755 9.8404C14.7734 9.61285 14.381 9.21431 14.1879 8.79716C13.3042 6.88752 12.4901 4.94552 11.6551 3.01354C11.2279 2.02514 11.2318 2.02342 10.2623 1.86375Z"
				fill="#4D3692"
			/>
		</svg>
	);
}
