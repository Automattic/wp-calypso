import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useElements, CardElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useMemo } from 'react';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { ProcessPayment } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';
import type { I18n } from '@wordpress/i18n';
import type { State } from 'calypso/state/partner-portal/credit-card-form/reducer';

const debug = debugFactory( 'calypso:partner-portal:credit-card' );

export default function CreditCardSubmitButton( {
	disabled,
	onClick,
	store,
	stripe,
	stripeConfiguration,
	activeButtonText,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: State;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	activeButtonText: string | undefined;
} ): JSX.Element {
	const { __ } = useI18n();
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const useAsPrimaryPaymentMethod = useSelect( ( select ) =>
		select( 'credit-card' ).useAsPrimaryPaymentMethod()
	);
	const cardholderName = fields.cardholderName;
	const { formStatus } = useFormStatus();
	const elements = useElements();
	const cardElement = elements?.getElement( CardElement ) ?? undefined;
	const formSubmitting = FormStatus.SUBMITTING === formStatus;

	const buttonContents = useMemo( () => {
		if ( formStatus === FormStatus.SUBMITTING ) {
			return __( 'Processing…' );
		}
		if ( formStatus === FormStatus.READY ) {
			return activeButtonText || __( 'Save payment method' );
		}
		return __( 'Please wait…' );
	}, [ formStatus, activeButtonText, __ ] );

	return (
		<Button
			className={ ! formSubmitting ? 'button is-primary' : '' }
			disabled={ disabled }
			onClick={ () => {
				if ( isCreditCardFormValid( store, __ ) ) {
					debug( 'submitting stripe payment' );

					if ( ! onClick ) {
						throw new Error(
							'Missing onClick prop; CreditCardSubmitButton must be used as a payment button in CheckoutSubmitButton'
						);
					}

					onClick( {
						stripe,
						name: cardholderName?.value,
						stripeConfiguration,
						cardElement,
						useAsPrimaryPaymentMethod,
					} );
					return;
				}
			} }
			buttonType="primary"
			isBusy={ formSubmitting }
			fullWidth
		>
			{ buttonContents }
		</Button>
	);
}

function isCreditCardFormValid( store: State, __: I18n[ '__' ] ) {
	debug( 'validating credit card fields' );

	const fields = store.selectors.getFields( store.getState() );
	const cardholderName = fields.cardholderName;
	if ( ! cardholderName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.setFieldValue( 'cardholderName', '' ) );
		store.dispatch(
			store.actions.setFieldError( 'cardholderName', __( 'This field is required' ) )
		);
	}
	const errors = store.selectors.getCardDataErrors( store.getState() );
	const incompleteFieldKeys = store.selectors.getIncompleteFieldKeys( store.getState() );
	const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

	if ( incompleteFieldKeys.length > 0 ) {
		// Show "this field is required" for each incomplete field
		incompleteFieldKeys.map( ( key: string ) =>
			store.dispatch( store.actions.setCardDataError( key, __( 'This field is required' ) ) )
		);
	}
	if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
		return false;
	}
	return true;
}
