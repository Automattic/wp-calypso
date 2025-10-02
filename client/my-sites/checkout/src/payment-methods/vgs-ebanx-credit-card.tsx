import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import { VgsEbanxCreditCardForm } from '../components/vgs-ebanx-credit-card-form';
import { VgsEbanxCreditCardFormProvider } from '../components/vgs-ebanx-credit-card-form-provider';

const debug = debugFactory( 'calypso:vgs-ebanx-payment-method' );

export const VgsEbanxCreditCardPaymentMethod = () => {
	const submitButton = (
		<button
			type="submit"
			className="vgs-ebanx-submit-button"
			onClick={ async () => {
				try {
					// This will be handled by the form provider
					debug( 'VGS Ebanx submit button clicked' );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( 'Ebanx payment submission failed:', error );
				}
			} }
		>
			{ __( 'Pay with Card - VGS Ebanx', 'calypso' ) }
		</button>
	);

	return {
		id: 'vgs-ebanx',
		paymentProcessorId: 'vgs-ebanx',
		label: (
			<div className="vgs-ebanx-payment-method-label">
				<span>{ __( 'Credit Card (Ebanx)', 'calypso' ) }</span>
			</div>
		),
		activeContent: (
			<VgsEbanxCreditCardFormProvider>
				<VgsEbanxCreditCardForm />
			</VgsEbanxCreditCardFormProvider>
		),
		submitButton,
		getAriaLabel: ( localize: ( value: string ) => string ) => localize( 'Credit Card (Ebanx)' ),
	};
};
