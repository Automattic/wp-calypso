/**
 * External dependencies
 */
import React, { ReactElement, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import {
	StripeHookProvider,
	useStripe,
	createStripePaymentMethod,
} from '@automattic/calypso-stripe';
import { CardElement } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTelInput from 'calypso/components/forms/form-tel-input';
import FormLabel from 'calypso/components/forms/form-label';
import { Button, Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardEntryForm( props ): ReactElement {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const [ cardName, setCardName ] = useState( '' );
	const [ cardEmail, setCardEmail ] = useState( '' );
	const [ cardPhone, setCardPhone ] = useState( '' );

	const handleSubmit = ( e ) => {
		e.preventDefault();
	};

	return (
		<div className="credit-card-entry-form">
			<div className="credit-card-entry-form__header">{ translate( 'Credit card details' ) }</div>
			<div className="credit-card-entry-form__field">
				<FormLabel>{ translate( 'Name' ) }</FormLabel>
				<FormTextInput placeholder="Jane Doe" />
			</div>
			<div className="credit-card-entry-form__field">
				<FormLabel>{ translate( 'Email' ) }</FormLabel>
				<FormTextInput placeholder="janedoe@gmail.com" />
			</div>
			<div className="credit-card-entry-form__field">
				<FormLabel>{ translate( 'Phone' ) }</FormLabel>
				<FormTelInput placeholder="(951) 555-0123" />
			</div>
			<div className="credit-card-entry-form__field">
				<FormLabel>{ translate( 'Card details' ) }</FormLabel>
				<CardElement className="credit-card-entry-form__card-field" />
			</div>

			<div className="credit-card-entry-form__buttons">
				<Button onClick={ () => page( '/partner-portal/payment-method' ) }>
					{ translate( 'Go back' ) }
				</Button>
				<Button onClick={ handleSubmit } primary>
					{ translate( 'Save payment method' ) }
				</Button>
			</div>
		</div>
	);
}
