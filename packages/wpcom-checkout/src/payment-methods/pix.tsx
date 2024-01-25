import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, Fragment, ReactNode, useState } from 'react';
import Field from '../field';
import type { PaymentMethod, ProcessPayment } from '@automattic/composite-checkout';

interface PixPaymentMethodStateShape {
	cardholderName: string;
	countryCode: string;
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
		countryCode: '',
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
	padding: 0 24px 24px 24px;
	display: flex;
	flex-direction: column;
	gap: 14px;
`;

function PixForm( { state }: { state: PixPaymentMethodState } ) {
	useSubscribeToEventEmitter( state );
	const { formStatus } = useFormStatus();
	const translate = useTranslate();
	// TODO: make State field a dropdown

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
			<Field
				type="text"
				id="state"
				onChange={ ( value: string ) => {
					state.change( 'state', value );
				} }
				label={ translate( 'State' ) }
				value={ state.data.state }
				disabled={ formStatus !== FormStatus.READY }
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
					countryCode: state.data.countryCode,
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

function PixLabel() {
	return (
		<Fragment>
			<span>Pix</span>
		</Fragment>
	);
}
