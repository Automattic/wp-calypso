import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { __ } from '@wordpress/i18n';

/**
 * The interior of the main submit button in the PaymentMethodSelector for most
 * payment methods. Payment methods which have a special button (eg: PayPal,
 * Google Pay, Apple Pay) will not use this. See each payment method to be sure
 * how it works.
 *
 * This is different from the submit button used by checkout.
 */
export function PaymentMethodSelectorSubmitButtonContent( { text }: { text: string } ) {
	const { formStatus } = useFormStatus();

	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}

	if ( formStatus !== FormStatus.READY ) {
		return __( 'Please wait…' );
	}

	return text;
}
