import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { cloneElement } from 'react';
import joinClasses from '../lib/join-classes';
import { useAllPaymentMethods, usePaymentMethodId } from '../lib/payment-methods';
import { useFormStatus, FormStatus, useProcessPayment } from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';
import type { PaymentMethod, PaymentProcessorSubmitData } from '../types';

const CheckoutSubmitButtonWrapper = styled.div`
	&.checkout-submit-button--inactive {
		display: none;
	}
`;

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
	const paymentMethods = useAllPaymentMethods();

	return (
		<>
			{ paymentMethods.map( ( paymentMethod ) => {
				return (
					<CheckoutSubmitButtonForPaymentMethod
						key={ paymentMethod.id }
						paymentMethod={ paymentMethod }
						validateForm={ validateForm }
						className={ className }
						disabled={ disabled }
						onLoadError={ onLoadError }
					/>
				);
			} ) }
		</>
	);
}

function CheckoutSubmitButtonForPaymentMethod( {
	paymentMethod,
	validateForm,
	className,
	disabled,
	onLoadError,
}: {
	paymentMethod: PaymentMethod;
	validateForm?: () => Promise< boolean >;
	className?: string;
	disabled?: boolean;
	onLoadError?: ( error: Error ) => void;
} ) {
	const [ activePaymentMethodId ] = usePaymentMethodId();
	const isActive = paymentMethod.id === activePaymentMethodId;
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = disabled || formStatus !== FormStatus.READY;
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
			<CheckoutSubmitButtonWrapper
				className={ joinClasses( [
					className,
					'checkout-submit-button',
					isActive ? 'checkout-submit-button--active' : 'checkout-submit-button--inactive',
				] ) }
			>
				{ clonedSubmitButton }
			</CheckoutSubmitButtonWrapper>
		</CheckoutErrorBoundary>
	);
}
