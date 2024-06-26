import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { CardElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { creditCardStore } from 'calypso/state/partner-portal/credit-card-form';
import type { StripeElementChangeEvent, StripeElementStyle } from '@stripe/stripe-js';

export default function CreditCardElementField( {
	setIsStripeFullyLoaded,
	handleStripeFieldChange,
	stripeElementStyle,
}: {
	setIsStripeFullyLoaded: ( value: boolean ) => void;
	handleStripeFieldChange: ( input: StripeElementChangeEvent ) => void;
	stripeElementStyle: StripeElementStyle;
} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const { card: cardError } = useSelect(
		( select ) => select( creditCardStore ).getCardDataErrors(),
		[]
	);

	return (
		<div className="credit-card-fields__input-field">
			<label className="credit-card-fields__label">
				<span className="credit-card-fields__label-text">{ translate( 'Card details' ) }</span>
				<span
					className={ clsx( 'credit-card-fields__stripe-element', 'number', {
						'credit-card-fields__stripe-element--has-error': cardError,
					} ) }
				>
					<CardElement
						options={ {
							disabled: isDisabled,
							style: stripeElementStyle,
						} }
						onReady={ () => {
							setIsStripeFullyLoaded( true );
						} }
						onChange={ ( input ) => {
							handleStripeFieldChange( input );
						} }
					/>
					{ cardError && <span className="credit-card-fields__stripe-error">{ cardError }</span> }
				</span>
			</label>
		</div>
	);
}
