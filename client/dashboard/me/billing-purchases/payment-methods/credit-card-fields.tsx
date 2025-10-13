import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { __experimentalInputControl as InputControl } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import type { StripeElementStyle } from '@stripe/stripe-js';
import type { Field, DataFormControlProps } from '@wordpress/dataviews';

import './credit-card-fields.scss';

const stripeElementStyle: StripeElementStyle = {
	base: {
		fontSize: '16px',
		color: '#32325d',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
		'::placeholder': {
			color: '#aab7c4',
		},
	},
	invalid: {
		color: '#fa755a',
		iconColor: '#fa755a',
	},
};

interface CreditCardFieldsData {
	cardholderName: string;
	cardNumber: string;
	cardExpiry: string;
	cardCvc: string;
}

function StripeCardNumberField( { field }: DataFormControlProps< CreditCardFieldsData > ) {
	return (
		<>
			<label htmlFor="card-number" className="credit-card-field__label">
				{ field.label }
			</label>
			<div className="credit-card-field__stripe-element">
				<CardNumberElement
					id="card-number"
					options={ {
						style: stripeElementStyle,
						showIcon: true,
					} }
				/>
			</div>
		</>
	);
}

function StripeCardExpiryField( { field }: DataFormControlProps< CreditCardFieldsData > ) {
	return (
		<>
			<label htmlFor="card-expiry" className="credit-card-field__label">
				{ field.label }
			</label>
			<div className="credit-card-field__stripe-element">
				<CardExpiryElement
					id="card-expiry"
					options={ {
						style: stripeElementStyle,
					} }
				/>
			</div>
		</>
	);
}

function StripeCardCvcField( { field }: DataFormControlProps< CreditCardFieldsData > ) {
	return (
		<>
			<label htmlFor="card-cvc" className="credit-card-field__label">
				{ field.label }
			</label>
			<div className="credit-card-field__stripe-element">
				<CardCvcElement
					id="card-cvc"
					options={ {
						style: stripeElementStyle,
					} }
				/>
			</div>
		</>
	);
}

export function CreditCardFields( {
	cardholderName,
	onCardholderNameChange,
}: {
	cardholderName: string;
	onCardholderNameChange: ( name: string ) => void;
} ) {
	const formData: CreditCardFieldsData = {
		cardholderName,
		cardNumber: '',
		cardExpiry: '',
		cardCvc: '',
	};

	const fields: Field< CreditCardFieldsData >[] = useMemo(
		() => [
			{
				id: 'cardholderName',
				label: __( 'Cardholder name' ),
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							__next40pxDefaultSize
							label={ field.label }
							placeholder={ __( 'Name on card' ) }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value ?? '' } );
							} }
						/>
					);
				},
			},
			{
				id: 'cardNumber',
				label: __( 'Card number' ),
				Edit: StripeCardNumberField,
			},
			{
				id: 'cardExpiry',
				label: __( 'Expiry date' ),
				Edit: StripeCardExpiryField,
			},
			{
				id: 'cardCvc',
				label: __( 'CVV' ),
				Edit: StripeCardCvcField,
			},
		],
		[]
	);

	const form = useMemo(
		() => ( {
			type: 'regular' as const,
			labelPosition: 'top' as const,
			fields: [ 'cardholderName', 'cardNumber', 'cardExpiry', 'cardCvc' ],
		} ),
		[]
	);

	return (
		<DataForm< CreditCardFieldsData >
			data={ formData }
			fields={ fields }
			form={ form }
			onChange={ ( edits ) => {
				if ( edits.cardholderName !== undefined ) {
					onCardholderNameChange( edits.cardholderName );
				}
			} }
		/>
	);
}
