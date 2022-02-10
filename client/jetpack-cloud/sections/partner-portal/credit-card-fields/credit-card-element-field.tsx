import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { CardElement } from '@stripe/react-stripe-js';
import { StripeElementChangeEvent } from '@stripe/stripe-js';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';

export default function CreditCardElementField( {
	setIsStripeFullyLoaded,
	handleStripeFieldChange,
}: {
	setIsStripeFullyLoaded: ( value: boolean ) => void;
	handleStripeFieldChange: ( input: StripeElementChangeEvent ) => void;
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const { card: cardError } = useSelect( ( select ) =>
		select( 'credit-card' ).getCardDataErrors()
	);

	return (
		<div className="credit-card-fields__input-field">
			<label className="credit-card-fields__label">
				<span className="credit-card-fields__label-text">{ __( 'Card details' ) }</span>
				<span
					className={ classnames( {
						'credit-card-fields__stripe-element': true,
						'credit-card-fields__stripe-element--has-error': cardError,
						number: true,
					} ) }
				>
					<CardElement
						options={ {
							disabled: isDisabled,
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
