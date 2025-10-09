import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { StripeElementStyle } from '@stripe/stripe-js';

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

export function CreditCardFields( {
	cardholderName,
	onCardholderNameChange,
}: {
	cardholderName: string;
	onCardholderNameChange: ( name: string ) => void;
} ) {
	return (
		<>
			<TextControl
				label={ __( 'Cardholder name' ) }
				value={ cardholderName }
				onChange={ onCardholderNameChange }
				placeholder={ __( 'Name on card' ) }
				__nextHasNoMarginBottom
			/>

			<div className="credit-card-field">
				<label htmlFor="card-number">{ __( 'Card number' ) }</label>
				<div className="credit-card-field__stripe-element">
					<CardNumberElement
						id="card-number"
						options={ {
							style: stripeElementStyle,
							showIcon: true,
						} }
					/>
				</div>
			</div>

			<div className="credit-card-field-row">
				<div className="credit-card-field">
					<label htmlFor="card-expiry">{ __( 'Expiry date' ) }</label>
					<div className="credit-card-field__stripe-element">
						<CardExpiryElement
							id="card-expiry"
							options={ {
								style: stripeElementStyle,
							} }
						/>
					</div>
				</div>

				<div className="credit-card-field">
					<label htmlFor="card-cvc">{ __( 'CVV' ) }</label>
					<div className="credit-card-field__stripe-element">
						<CardCvcElement
							id="card-cvc"
							options={ {
								style: stripeElementStyle,
							} }
						/>
					</div>
				</div>
			</div>
		</>
	);
}
