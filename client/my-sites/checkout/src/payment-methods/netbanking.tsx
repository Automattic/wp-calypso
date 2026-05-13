import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { snakeToCamelCase } from '@automattic/js-utils';
import { Field } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useEffect, useState, Fragment, ReactNode } from 'react';
import { maskField } from 'calypso/lib/checkout';
import { validatePaymentDetails } from 'calypso/lib/checkout/validation';
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/src/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/src/components/summary-details';
import useCountryList from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { CountrySpecificPaymentFields } from '../components/country-specific-payment-fields';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'composite-checkout:netbanking-payment-method' );

interface NetBankingFieldState {
	value: string;
	isTouched: boolean;
	errors: string[];
}

type StateSubscriber = () => void;

class NetBankingPaymentMethodState {
	customerName: { value: string; isTouched: boolean } = { value: '', isTouched: false };
	fields: Record< string, NetBankingFieldState > = {};
	subscribers: StateSubscriber[] = [];

	changeCustomerName = ( value: string ): void => {
		this.customerName = { value, isTouched: true };
		this.notifySubscribers();
	};

	setFieldValue = ( key: string, value: string ): void => {
		const maskedValue = maskField( key, this.fields[ key ]?.value, value );
		this.fields = {
			...this.fields,
			[ key ]: {
				value: maskedValue,
				isTouched: true,
				errors: [],
			},
		};
		this.notifySubscribers();
	};

	setFieldError = ( key: string, message: string ): void => {
		this.fields = {
			...this.fields,
			[ key ]: {
				...( this.fields[ key ] ?? { value: '', isTouched: false, errors: [] } ),
				errors: [ message ],
			},
		};
		this.notifySubscribers();
	};

	touchAllFields = (): void => {
		this.fields = Object.keys( this.fields ).reduce(
			( obj, key ) => ( {
				...obj,
				[ key ]: {
					...this.fields[ key ],
					isTouched: true,
				},
			} ),
			{}
		);
		this.notifySubscribers();
	};

	resetFields = (): void => {
		this.fields = {};
		this.notifySubscribers();
	};

	subscribe = ( callback: () => void ): ( () => void ) => {
		this.subscribers.push( callback );
		return () => {
			this.subscribers = this.subscribers.filter( ( subscriber ) => subscriber !== callback );
		};
	};

	notifySubscribers = (): void => {
		this.subscribers.forEach( ( subscriber ) => subscriber() );
	};
}

export function createNetBankingMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	const state = new NetBankingPaymentMethodState();

	return {
		id: 'netbanking',
		hasRequiredFields: true,
		paymentProcessorId: 'netbanking',
		label: <NetBankingLabel />,
		activeContent: <NetBankingFields state={ state } />,
		submitButton: (
			<NetBankingPayButton state={ state } submitButtonContent={ submitButtonContent } />
		),
		inactiveContent: <NetBankingSummary state={ state } />,
		getAriaLabel: () => 'Transferência bancária',
	};
}

function useSubscribeToEventEmitter( state: NetBankingPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
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

function NetBankingFields( { state }: { state: NetBankingPaymentMethodState } ) {
	const { __ } = useI18n();
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const countriesList = useCountryList();

	const getFieldValue = ( key: string ) => state.fields[ key ]?.value ?? '';
	const getErrorMessagesForField = ( key: string ) => state.fields[ key ]?.errors ?? [];

	return (
		<NetBankingFormWrapper>
			<NetBankingField
				id="netbanking-cardholder-name"
				type="Text"
				autoComplete="cc-name"
				label={ __( 'Your name' ) }
				value={ state.customerName.value }
				onChange={ state.changeCustomerName }
				isError={ state.customerName.isTouched && state.customerName.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<div className="netbanking__contact-fields">
				<CountrySpecificPaymentFields
					countryCode="IN" // If this payment method is available and the country is not India, we have other problems
					countriesList={ countriesList }
					getErrorMessages={ getErrorMessagesForField }
					getFieldValue={ getFieldValue }
					handleFieldChange={ state.setFieldValue }
					disableFields={ isDisabled }
				/>
			</div>
		</NetBankingFormWrapper>
	);
}

function NetBankingPayButton( {
	disabled,
	onClick,
	state,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	state: NetBankingPaymentMethodState;
	submitButtonContent: ReactNode;
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	useSubscribeToEventEmitter( state );
	const massagedFields: Record< string, string > = Object.entries( state.fields ).reduce(
		( accum, [ key, fieldState ] ) => ( {
			...accum,
			[ snakeToCamelCase( key ) ]: fieldState.value,
		} ),
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
				if ( isFormValid( state, contactCountryCode, __, reduxDispatch ) ) {
					debug( 'submitting netbanking payment' );
					onClick( {
						...massagedFields,
						name: state.customerName.value,
						address: massagedFields?.address1,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
		</Button>
	);
}

function NetBankingSummary( { state }: { state: NetBankingPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );

	return (
		<SummaryDetails>
			<SummaryLine>{ state.customerName.value }</SummaryLine>
		</SummaryDetails>
	);
}

function isFormValid(
	state: NetBankingPaymentMethodState,
	contactCountryCode: string,
	__: ( text: string ) => string,
	reduxDispatch: CalypsoDispatch
) {
	// Touch fields so that we show errors
	state.touchAllFields();
	let isValid = true;

	if ( ! state.customerName.value.length ) {
		// Touch the field so it displays a validation error
		state.changeCustomerName( '' );
		isValid = false;
	}

	const validationResults = validatePaymentDetails(
		Object.entries( {
			...state.fields,
			country: { value: contactCountryCode },
			name: state.customerName,
		} ).reduce( ( accum: Record< string, string >, [ key, managedValue ] ) => {
			accum[ key ] = managedValue.value;
			return accum;
		}, {} ),
		'netbanking'
	);

	Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
		errors.map( ( error ) => {
			isValid = false;
			state.setFieldError( key, error );
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

function NetBankingLogoImg( { className }: { className?: string } ) {
	return (
		<img src="/calypso/images/upgrades/netbanking.svg" alt="NetBanking" className={ className } />
	);
}

const NetBankingLogo = styled( NetBankingLogoImg )`
	width: 76px;
`;

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
