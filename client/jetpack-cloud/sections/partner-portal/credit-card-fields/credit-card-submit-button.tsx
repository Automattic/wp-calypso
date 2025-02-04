import { isEnabled } from '@automattic/calypso-config';
import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useElements, CardElement } from '@stripe/react-stripe-js';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useMemo } from 'react';
import { creditCardStore } from 'calypso/state/partner-portal/credit-card-form';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { ProcessPayment } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

const debug = debugFactory( 'calypso:partner-portal:credit-card' );

export default function CreditCardSubmitButton( {
	disabled,
	onClick,
	stripe,
	stripeConfiguration,
	activeButtonText,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	stripe: Stripe | null;
	stripeConfiguration: StripeConfiguration | null;
	activeButtonText: string | undefined;
} ) {
	const { __ } = useI18n();
	const { fields, useAsPrimaryPaymentMethod, errors, incompleteFieldKeys } = useSelect(
		( select ) => {
			const store = select( creditCardStore );
			return {
				fields: store.getFields(),
				useAsPrimaryPaymentMethod: store.useAsPrimaryPaymentMethod(),
				errors: store.getCardDataErrors(),
				incompleteFieldKeys: store.getIncompleteFieldKeys(),
			};
		},
		[]
	);
	const cardholderName = fields.cardholderName;
	const { formStatus } = useFormStatus();
	const elements = useElements();
	const cardElement = elements?.getElement( CardElement ) ?? undefined;
	const formSubmitting = FormStatus.SUBMITTING === formStatus;

	const isNewCardAdditionEnabled = isEnabled( 'jetpack/card-addition-improvements' );

	const buttonContents = useMemo( () => {
		if ( formStatus === FormStatus.SUBMITTING ) {
			return __( 'Processing…' );
		}
		if ( formStatus === FormStatus.READY ) {
			return (
				activeButtonText ||
				( isNewCardAdditionEnabled ? __( 'Add card' ) : __( 'Save payment method' ) )
			);
		}
		return __( 'Please wait…' );
	}, [ formStatus, __, activeButtonText, isNewCardAdditionEnabled ] );

	const { setCardDataError, setFieldValue, setFieldError } = useDispatch( creditCardStore );

	const handleButtonClick = () => {
		debug( 'validating credit card fields' );

		if ( ! cardholderName?.value.length ) {
			// Touch the field so it displays a validation error
			setFieldValue( 'cardholderName', '' );
			setFieldError( 'cardholderName', __( 'This field is required' ) );
		}
		const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

		if ( incompleteFieldKeys.length > 0 ) {
			// Show "this field is required" for each incomplete field
			incompleteFieldKeys.map( ( key: string ) =>
				setCardDataError( key, __( 'This field is required' ) )
			);
		}

		if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
			// credit card is invalid
			return false;
		}

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
	};

	return (
		<Button
			className={ ! formSubmitting ? 'button is-primary' : '' }
			disabled={ disabled }
			onClick={ handleButtonClick }
			buttonType="primary"
			isBusy={ formSubmitting }
			fullWidth
		>
			{ buttonContents }
		</Button>
	);
}
