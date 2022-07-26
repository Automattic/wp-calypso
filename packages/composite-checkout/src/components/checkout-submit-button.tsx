import { useI18n } from '@wordpress/react-i18n';
import { cloneElement } from 'react';
import joinClasses from '../lib/join-classes';
import { useFormStatus, FormStatus, usePaymentMethod, useProcessPayment } from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';
import type { PaymentProcessorSubmitData } from '../types';

export default function CheckoutSubmitButton( {
	validateForm,
	className,
	disabled,
	onLoadError,
}: {
	validateForm?: () => Promise< boolean >;
	className?: string;
	disabled?: boolean;
	onLoadError?: ( error: Error ) => void;
} ) {
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = disabled || formStatus !== FormStatus.READY;
	const paymentMethod = usePaymentMethod();
	const onClick = useProcessPayment( paymentMethod?.paymentProcessorId ?? '' );
	const onClickWithValidation = ( processorData: PaymentProcessorSubmitData ) => {
		if ( validateForm ) {
			validateForm().then( ( validationResult: boolean ) => {
				if ( validationResult ) {
					onClick( processorData );
				}
				// Take no action if the form is not valid. User notification must be
				// handled elsewhere.
			} );
			return;
		}
		// Always run if there is no validation callback.
		return onClick( processorData );
	};

	if ( ! paymentMethod ) {
		return null;
	}
	const { submitButton } = paymentMethod;
	if ( ! submitButton ) {
		return null;
	}

	// We clone the element to add props
	const clonedSubmitButton = cloneElement( submitButton, {
		disabled: isDisabled,
		onClick: onClickWithValidation,
	} );
	return (
		<CheckoutErrorBoundary
			errorMessage={ __( 'There was a problem with the submit button.' ) }
			onError={ onLoadError }
		>
			<div className={ joinClasses( [ className, 'checkout-submit-button' ] ) }>
				{ clonedSubmitButton }
			</div>
		</CheckoutErrorBoundary>
	);
}
