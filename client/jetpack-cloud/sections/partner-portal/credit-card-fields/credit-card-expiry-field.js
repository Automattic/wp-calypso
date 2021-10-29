/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { CardExpiryElement } from '@stripe/react-stripe-js';
import { FormStatus, useFormStatus, useSelect } from '@automattic/composite-checkout';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardExpiryField( { handleStripeFieldChange, stripeElementStyle } ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const { cardExpiry: cardExpiryError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<label className="credit-card-fields__label">
			<span className="credit-card-fields__label-text">{ translate( 'Expiry date' ) }</span>
			<span
				className={ classnames( {
					'credit-card-fields__stripe-element': true,
					'credit-card-fields__stripe-element--has-error': cardExpiryError,
					'expiration-date': true,
				} ) }
			>
				<CardExpiryElement
					style={ stripeElementStyle }
					onChange={ ( input ) => {
						handleStripeFieldChange( input );
					} }
					disabled={ isDisabled }
				/>
			</span>
			{ cardExpiryError && (
				<span className="credit-card-fields__stripe-error">{ cardExpiryError }</span>
			) }
		</label>
	);
}
