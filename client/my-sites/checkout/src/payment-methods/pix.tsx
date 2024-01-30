import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { Field } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, Fragment, ReactNode, useState, ChangeEvent } from 'react';
import {
	getStateLabelText,
	STATE_SELECT_TEXT,
} from 'calypso/components/domains/contact-details-form-fields/custom-form-fieldsets/utils';
import { StateSelect } from 'calypso/my-sites/domains/components/form';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

// We currently only show Pix for Brazil so we hard-code the country to avoid
// asking the user twice or having to grab it from the billing information
// state.
const countryCode = 'BR';

interface PixPaymentMethodStateShape {
	cardholderName: string;
	state: string;
	city: string;
	postalCode: string;
	address: string;
	streetNumber: string;
	phoneNumber: string;
	taxpayerId: string;
}

type PixPaymentMethodKey = keyof PixPaymentMethodStateShape;

type StateSubscriber = () => void;

class PixPaymentMethodState {
	data: PixPaymentMethodStateShape = {
		cardholderName: '',
		state: '',
		city: '',
		postalCode: '',
		address: '',
		streetNumber: '',
		phoneNumber: '',
		taxpayerId: '',
	};

	subscribers: StateSubscriber[] = [];

	change = ( field: PixPaymentMethodKey, newValue: string ): void => {
		this.data[ field ] = newValue;
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

export function createPixPaymentMethod( {
	submitButtonContent,
}: {
	submitButtonContent: ReactNode;
} ): PaymentMethod {
	const state = new PixPaymentMethodState();

	return {
		id: 'pix',
		paymentProcessorId: 'pix',
		label: <PixLabel />,
		activeContent: <PixForm state={ state } />,
		submitButton: <PixPayButton submitButtonContent={ submitButtonContent } state={ state } />,
		getAriaLabel: () => 'Pix',
	};
}

function useSubscribeToEventEmitter( state: PixPaymentMethodState ) {
	const [ , forceReload ] = useState( 0 );
	useEffect( () => {
		return state.subscribe( () => {
			forceReload( ( val: number ) => val + 1 );
		} );
	}, [ state ] );
}

const PixFormWrapper = styled.div`
	position: relative;
	padding: 0 24px 24px 24px;
	display: flex;
	flex-direction: column;
	gap: 14px;
`;

function PixForm( { state }: { state: PixPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const translate = useTranslate();

	return (
		<PixFormWrapper>
			<Field
				type="text"
				id="cardholderName"
				onChange={ ( value: string ) => {
					state.change( 'cardholderName', value );
				} }
				label={ translate( 'Name' ) }
				value={ state.data.cardholderName }
				disabled={ formStatus !== FormStatus.READY }
			/>
			<Field
				type="text"
				id="taxpayerId"
				onChange={ ( value: string ) => {
					state.change( 'taxpayerId', value );
				} }
				label={ translate( 'Taxpayer Identification Number' ) }
				value={ state.data.taxpayerId }
				disabled={ formStatus !== FormStatus.READY }
			/>
			<Field
				type="text"
				id="phoneNumber"
				onChange={ ( value: string ) => {
					state.change( 'phoneNumber', value );
				} }
				label={ translate( 'Phone' ) }
				value={ state.data.phoneNumber }
				disabled={ formStatus !== FormStatus.READY }
			/>
			<Field
				type="text"
				id="address"
				onChange={ ( value: string ) => {
					state.change( 'address', value );
				} }
				label={ translate( 'Address' ) }
				value={ state.data.address }
				disabled={ formStatus !== FormStatus.READY }
			/>
			<Field
				type="text"
				id="streetNumber"
				onChange={ ( value: string ) => {
					state.change( 'streetNumber', value );
				} }
				label={ translate( 'Street Number' ) }
				value={ state.data.streetNumber }
				disabled={ formStatus !== FormStatus.READY }
			/>
			<Field
				type="text"
				id="city"
				onChange={ ( value: string ) => {
					state.change( 'city', value );
				} }
				label={ translate( 'City' ) }
				value={ state.data.city }
				disabled={ formStatus !== FormStatus.READY }
			/>
			<StateSelect
				label={ getStateLabelText( countryCode ) }
				countryCode={ countryCode }
				selectText={ STATE_SELECT_TEXT[ countryCode ] }
				value={ state.data.state }
				onChange={ ( event: ChangeEvent< HTMLSelectElement > ) => {
					state.change( 'state', event.target.value );
				} }
			/>
			<Field
				type="text"
				id="postalCode"
				onChange={ ( value: string ) => {
					state.change( 'postalCode', value );
				} }
				label={ translate( 'Postal Code' ) }
				value={ state.data.postalCode }
				disabled={ formStatus !== FormStatus.READY }
			/>
		</PixFormWrapper>
	);
}

function PixPayButton( {
	disabled,
	onClick,
	submitButtonContent,
	state,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	submitButtonContent: ReactNode;
	state: PixPaymentMethodState;
} ) {
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; PixPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				onClick( {
					name: state.data.cardholderName,
					countryCode: countryCode,
					state: state.data.state,
					city: state.data.city,
					postalCode: state.data.postalCode,
					address: state.data.address,
					streetNumber: state.data.streetNumber,
					phoneNumber: state.data.phoneNumber,
					document: state.data.taxpayerId,
				} );
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			{ submitButtonContent }
			<div className="pix-modal-target" />
		</Button>
	);
}

const PixLogoWrapper = styled.div`
	width: 24px;
`;

function PixLogo() {
	return (
		<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
			<defs />
			<g fill="#4BB8A9" fill-rule="evenodd">
				<path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z" />
				<path d="M22.758 200.753l58.024-58.024h31.787c13.84 0 27.384 5.605 37.172 15.394l76.694 76.693c7.178 7.179 16.596 10.768 26.033 10.768 9.417 0 18.854-3.59 26.014-10.75l76.989-76.99c9.787-9.787 23.331-15.393 37.171-15.393h37.654l58.3 58.302c30.343 30.344 30.343 79.523 0 109.867l-58.3 58.303H392.64c-13.84 0-27.384-5.605-37.171-15.394l-76.97-76.99c-13.914-13.894-38.172-13.894-52.066.02l-76.694 76.674c-9.788 9.788-23.332 15.413-37.172 15.413H80.782L22.758 310.62c-30.344-30.345-30.344-79.524 0-109.868" />
			</g>
		</svg>
	);
}

function PixLabel() {
	return (
		<Fragment>
			<span>Pix</span>
			<PixLogoWrapper>
				<PixLogo />
			</PixLogoWrapper>
		</Fragment>
	);
}
