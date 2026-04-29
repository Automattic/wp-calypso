import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { __experimentalInputControl as InputControl } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import type { StripeElementStyle } from '@stripe/stripe-js';
import type { Field, DataFormControlProps } from '@wordpress/dataviews';

import './credit-card-fields.scss';

const stripeElementStyle: StripeElementStyle = {
	base: {
		fontSize: '16px',
		color: '#32325d',
		iconColor: '#aab7c4',
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

function isDarkTheme() {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const theme = document.documentElement.dataset.theme;

	return (
		theme === 'dark' ||
		( theme === 'system' && window.matchMedia?.( '(prefers-color-scheme: dark)' ).matches )
	);
}

function getDashboardColor( variable: string, fallback: string ) {
	if ( typeof window === 'undefined' ) {
		return fallback;
	}

	return (
		getComputedStyle( document.documentElement ).getPropertyValue( variable ).trim() || fallback
	);
}

function getStripeElementStyle(): StripeElementStyle {
	if ( ! isDarkTheme() ) {
		return stripeElementStyle;
	}

	const textColor = getDashboardColor( '--dashboard__text-color', '#e0e0e0' );
	const mutedColor = getDashboardColor( '--dashboard__text-muted-color', '#bdbdbd' );

	return {
		...stripeElementStyle,
		base: {
			...stripeElementStyle.base,
			color: textColor,
			iconColor: mutedColor,
			'::placeholder': {
				color: mutedColor,
			},
		},
	};
}

function useStripeElementStyle() {
	const [ elementStyle, setElementStyle ] = useState< StripeElementStyle >( getStripeElementStyle );

	useEffect( () => {
		const updateElementStyle = () => {
			setElementStyle( getStripeElementStyle() );
		};
		const mediaQuery = window.matchMedia?.( '(prefers-color-scheme: dark)' );
		const observer =
			typeof MutationObserver !== 'undefined'
				? new MutationObserver( updateElementStyle )
				: undefined;

		observer?.observe( document.documentElement, {
			attributes: true,
			attributeFilter: [ 'data-theme' ],
		} );
		mediaQuery?.addEventListener( 'change', updateElementStyle );

		return () => {
			observer?.disconnect();
			mediaQuery?.removeEventListener( 'change', updateElementStyle );
		};
	}, [] );

	return elementStyle;
}

interface CreditCardFieldsData {
	cardholderName: string;
	cardNumber: string;
	cardExpiry: string;
	cardCvc: string;
}

interface StripeFieldProps extends DataFormControlProps< CreditCardFieldsData > {
	elementStyle: StripeElementStyle;
}

function StripeCardNumberField( { field, elementStyle }: StripeFieldProps ) {
	return (
		<>
			<label htmlFor="card-number" className="credit-card-field__label">
				{ field.label }
			</label>
			<div className="credit-card-field__stripe-element">
				<CardNumberElement
					id="card-number"
					options={ {
						style: elementStyle,
						showIcon: true,
					} }
				/>
			</div>
		</>
	);
}

function StripeCardExpiryField( { field, elementStyle }: StripeFieldProps ) {
	return (
		<>
			<label htmlFor="card-expiry" className="credit-card-field__label">
				{ field.label }
			</label>
			<div className="credit-card-field__stripe-element">
				<CardExpiryElement
					id="card-expiry"
					options={ {
						style: elementStyle,
					} }
				/>
			</div>
		</>
	);
}

function StripeCardCvcField( { field, elementStyle }: StripeFieldProps ) {
	return (
		<>
			<label htmlFor="card-cvc" className="credit-card-field__label">
				{ field.label }
			</label>
			<div className="credit-card-field__stripe-element">
				<CardCvcElement
					id="card-cvc"
					options={ {
						style: elementStyle,
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
	const elementStyle = useStripeElementStyle();

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
				Edit: ( props ) => <StripeCardNumberField { ...props } elementStyle={ elementStyle } />,
			},
			{
				id: 'cardExpiry',
				label: __( 'Expiry date' ),
				Edit: ( props ) => <StripeCardExpiryField { ...props } elementStyle={ elementStyle } />,
			},
			{
				id: 'cardCvc',
				label: __( 'CVV' ),
				Edit: ( props ) => <StripeCardCvcField { ...props } elementStyle={ elementStyle } />,
			},
		],
		[ elementStyle ]
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
