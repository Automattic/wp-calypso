/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { CardCvcElement } from '@stripe/react-stripe-js';
import { FormStatus, useFormStatus, useSelect } from '@automattic/composite-checkout';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import {
	LeftColumn,
	RightColumn,
} from 'calypso/my-sites/checkout/composite-checkout/components/ie-fallback';
import CVVImage from './cvv-image';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardCvvField( { handleStripeFieldChange, stripeElementStyle } ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const { cardCvc: cardCvcError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<label className="credit-card-fields__label">
			<span className="credit-card-fields__label-text">{ translate( 'Security code' ) }</span>
			<div className="credit-card-fields__grid-row">
				<LeftColumn>
					<span
						className={ classnames( {
							'credit-card-fields__stripe-element': true,
							'credit-card-fields__stripe-element--has-error': cardCvcError,
							// eslint-disable-next-line prettier/prettier
							cvv: true,
						} ) }
					>
						<CardCvcElement
							style={ stripeElementStyle }
							onChange={ ( input ) => {
								handleStripeFieldChange( input );
							} }
							disabled={ isDisabled }
						/>
					</span>
				</LeftColumn>
				<RightColumn>
					<CVVImage />
				</RightColumn>
			</div>
			{ cardCvcError && <span className="credit-card-fields__stripe-error">{ cardCvcError }</span> }
		</label>
	);
}
