/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { CardNumberElement } from '@stripe/react-stripe-js';
import { FormStatus, useFormStatus, useSelect, PaymentLogo } from '@automattic/composite-checkout';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardNumberField( {
	setIsStripeFullyLoaded,
	handleStripeFieldChange,
	stripeElementStyle,
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const brand = useSelect( ( select ) => select( 'credit-card' ).getBrand() );
	const { cardNumber: cardNumberError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<label className="credit-card-fields__label">
			<span className="credit-card-fields__label-text">{ __( 'Card number' ) }</span>
			<span
				className={ classnames( {
					'credit-card-fields__stripe-element': true,
					'credit-card-fields__stripe-element--has-error': cardNumberError,
					// eslint-disable-next-line prettier/prettier
					number: true,
				} ) }
			>
				<CardNumberElement
					style={ stripeElementStyle }
					onReady={ () => {
						setIsStripeFullyLoaded( true );
					} }
					onChange={ ( input ) => {
						handleStripeFieldChange( input );
					} }
					disabled={ isDisabled }
				/>
				<PaymentLogo brand={ brand } />

				{ cardNumberError && (
					<span className="credit-card-fields__stripe-error">{ cardNumberError }</span>
				) }
			</span>
		</label>
	);
}
