import { Button, useFormStatus, FormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import Field from '../field';
import { PaymentMethodLogos } from '../payment-method-logos';
import { SummaryLine, SummaryDetails } from '../summary-details';
import type { ManagedContactDetails } from '../types';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:stripe-upi-payment-method' );

interface StripeUpiPaymentMethodStateShape {
	customerName: string;
	address: string;
	streetNumber: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
}

type StripeUpiPaymentMethodKey = keyof StripeUpiPaymentMethodStateShape;

interface StripeUpiFieldState {
	value: string;
	isTouched: boolean;
}

type StateSubscriber = () => void;

class StripeUpiPaymentMethodState {
	data: StripeUpiPaymentMethodStateShape = {
		customerName: '',
		address: '',
		streetNumber: '',
		city: '',
		state: '',
		postalCode: '',
		country: '',
	};

	touched: Record< StripeUpiPaymentMethodKey, boolean > = {
		customerName: false,
		address: false,
		streetNumber: false,
		city: false,
		state: false,
		postalCode: false,
		country: false,
	};

	subscribers: StateSubscriber[] = [];

	change = ( field: StripeUpiPaymentMethodKey, newValue: string ): void => {
		this.data[ field ] = newValue;
		this.touched[ field ] = true;
		this.notifySubscribers();
	};

	getFieldState = ( field: StripeUpiPaymentMethodKey ): StripeUpiFieldState => {
		return {
			value: this.data[ field ],
			isTouched: this.touched[ field ],
		};
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

	isValid = (): boolean => {
		// Touch all fields that are empty so they display validation errors
		const fields: StripeUpiPaymentMethodKey[] = [
			'customerName',
			'address',
			'city',
			'state',
			'postalCode',
			'country',
		];

		fields.forEach( ( field ) => {
			if ( ! this.data[ field ].length ) {
				this.change( field, '' );
			}
		} );

		// Check if all required fields have values
		return fields.every( ( field ) => this.data[ field ].length > 0 );
	};
}

function useSubscribeToEventEmitter( state: StripeUpiPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
}

const StripeUpiFormWrapper = styled.div`
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

const StripeUpiField = styled( Field )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

function StripeUpiFields( { state }: { state: StripeUpiPaymentMethodState } ) {
	const { __ } = useI18n();
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	// Get live contact details from checkout store
	const checkoutContactDetails = useSelect( ( select ) => {
		const store = select( 'wpcom-checkout' );
		return store && typeof store === 'object' && 'getContactInfo' in store
			? ( store as { getContactInfo: () => ManagedContactDetails } ).getContactInfo()
			: null;
	}, [] ) as ManagedContactDetails | null;

	// Keep state, postalCode, and country synced with live checkout contact details.
	// These fields are disabled/readonly, so they should always reflect billing info.
	useEffect( () => {
		if ( checkoutContactDetails ) {
			if ( checkoutContactDetails.state?.value ) {
				state.change( 'state', checkoutContactDetails.state.value );
			}
			if ( checkoutContactDetails.postalCode?.value ) {
				state.change( 'postalCode', checkoutContactDetails.postalCode.value );
			}
			if ( checkoutContactDetails.countryCode?.value ) {
				state.change( 'country', checkoutContactDetails.countryCode.value );
			}
		}
	}, [ checkoutContactDetails, state ] );

	const customerName = state.getFieldState( 'customerName' );
	const address = state.getFieldState( 'address' );
	const streetNumber = state.getFieldState( 'streetNumber' );
	const city = state.getFieldState( 'city' );
	const stateField = state.getFieldState( 'state' );
	const postalCode = state.getFieldState( 'postalCode' );
	const country = state.getFieldState( 'country' );

	return (
		<StripeUpiFormWrapper>
			<StripeUpiField
				id="stripe-upi-cardholder-name"
				type="Text"
				autoComplete="name"
				label={ __( 'Your name' ) }
				value={ customerName.value }
				onChange={ ( value: string ) => state.change( 'customerName', value ) }
				isError={ customerName.isTouched && customerName.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<StripeUpiField
				id="stripe-upi-address-1"
				type="Text"
				autoComplete="address-line1"
				label={ __( 'Address line 1' ) }
				value={ address.value }
				onChange={ ( value: string ) => state.change( 'address', value ) }
				isError={ address.isTouched && address.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<StripeUpiField
				id="stripe-upi-address-2"
				type="Text"
				autoComplete="address-line2"
				label={ __( 'Address line 2' ) }
				value={ streetNumber.value }
				onChange={ ( value: string ) => state.change( 'streetNumber', value ) }
				isError={ false }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<StripeUpiField
				id="stripe-upi-city"
				type="Text"
				autoComplete="address-level2"
				label={ __( 'City' ) }
				value={ city.value }
				onChange={ ( value: string ) => state.change( 'city', value ) }
				isError={ city.isTouched && city.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled={ isDisabled }
			/>
			<StripeUpiField
				id="stripe-upi-state"
				type="Text"
				autoComplete="address-level1"
				label={ __( 'State' ) }
				value={ stateField.value }
				onChange={ ( value: string ) => state.change( 'state', value ) }
				isError={ stateField.isTouched && stateField.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled
			/>
			<StripeUpiField
				id="stripe-upi-postal-code"
				type="Text"
				autoComplete="postal-code"
				label={ __( 'Postcode' ) }
				value={ postalCode.value }
				onChange={ ( value: string ) => state.change( 'postalCode', value ) }
				isError={ postalCode.isTouched && postalCode.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled
			/>
			<StripeUpiField
				id="stripe-upi-country"
				type="Text"
				autoComplete="country"
				label={ __( 'Country' ) }
				value={ country.value }
				onChange={ ( value: string ) => state.change( 'country', value ) }
				isError={ country.isTouched && country.value.length === 0 }
				errorMessage={ __( 'This field is required' ) }
				disabled
			/>
		</StripeUpiFormWrapper>
	);
}

export function createStripeUpiMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	const state = new StripeUpiPaymentMethodState();

	return {
		id: 'stripe-upi',
		hasRequiredFields: true,
		paymentProcessorId: 'stripe-upi',
		label: <StripeUpiLabel />,
		activeContent: <StripeUpiFields state={ state } />,
		submitButton: (
			<StripeUpiSubmitButton submitButtonContent={ submitButtonContent } state={ state } />
		),
		inactiveContent: <StripeUpiSummary state={ state } />,
		// translators: UPI stands for Unified Payments Interface and may not need to be translated.
		getAriaLabel: ( __ ) => __( 'UPI' ),
	};
}

export function StripeUpiLabel() {
	const { __ } = useI18n();

	return (
		<Fragment>
			<span>{ __( 'UPI' ) }</span>
			<PaymentMethodLogos className="stripe-upi__logo payment-logos">
				<StripeUpiIcon />
			</PaymentMethodLogos>
		</Fragment>
	);
}

export function StripeUpiSummary( { state }: { state: StripeUpiPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );

	const customerName = state.getFieldState( 'customerName' );
	const address = state.getFieldState( 'address' );
	const streetNumber = state.getFieldState( 'streetNumber' );
	const city = state.getFieldState( 'city' );
	const stateField = state.getFieldState( 'state' );
	const postalCode = state.getFieldState( 'postalCode' );
	const country = state.getFieldState( 'country' );

	return (
		<SummaryDetails>
			<SummaryLine>{ customerName.value }</SummaryLine>
			<SummaryLine>{ address.value }</SummaryLine>
			{ streetNumber.value && <SummaryLine>{ streetNumber.value }</SummaryLine> }
			<SummaryLine>
				{ city.value }
				{ city.value && stateField.value ? ', ' : '' }
				{ stateField.value } { postalCode.value }
			</SummaryLine>
			<SummaryLine>{ country.value }</SummaryLine>
		</SummaryDetails>
	);
}

export function StripeUpiSubmitButton( {
	disabled,
	onClick,
	submitButtonContent,
	state,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	submitButtonContent: ReactNode;
	state: StripeUpiPaymentMethodState;
} ) {
	const { formStatus } = useFormStatus();
	useSubscribeToEventEmitter( state );

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; StripeUpiSubmitButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ ( ev ) => {
				ev.preventDefault();
				if ( state.isValid() ) {
					debug( 'Initiate Stripe UPI payment' );
					onClick( {
						name: state.data.customerName,
						address: state.data.address,
						streetNumber: state.data.streetNumber,
						city: state.data.city,
						state: state.data.state,
						postalCode: state.data.postalCode,
						country: state.data.country,
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

// UPI logo based on the NPCI UPI brand mark
export function StripeUpiIcon() {
	return (
		<svg
			width="50"
			height="20"
			viewBox="0 0 126 50"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<rect width="126" height="50" rx="4" fill="#F5F5F5" />
			<path d="M18 10 L10 40 H18 L26 10 Z" fill="#097939" />
			<path d="M28 10 L20 40 H28 L36 10 Z" fill="#ED752E" />
			<text
				x="50"
				y="34"
				fontFamily="Arial, sans-serif"
				fontSize="22"
				fontWeight="bold"
				fill="#333333"
				letterSpacing="1"
			>
				UPI
			</text>
		</svg>
	);
}
