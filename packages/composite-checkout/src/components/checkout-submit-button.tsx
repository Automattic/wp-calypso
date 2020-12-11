/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useFormStatus, FormStatus } from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { usePaymentMethod, useProcessPayment } from '../public-api';

export default function CheckoutSubmitButton( {
	className,
	disabled,
	onLoadError,
}: {
	className?: string;
	disabled?: boolean;
	onLoadError?: ( error: string ) => void;
} ): JSX.Element | null {
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = disabled || formStatus !== FormStatus.READY;
	const onClick = useProcessPayment();

	const paymentMethod = usePaymentMethod();
	if ( ! paymentMethod ) {
		return null;
	}
	const { submitButton } = paymentMethod;
	if ( ! submitButton ) {
		return null;
	}

	// We clone the element to add props
	const clonedSubmitButton = React.cloneElement( submitButton, { disabled: isDisabled, onClick } );
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
