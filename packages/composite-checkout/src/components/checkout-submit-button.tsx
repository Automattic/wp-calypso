import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { cloneElement } from 'react';
import joinClasses from '../lib/join-classes';
import { useAllPaymentMethods, usePaymentMethodId } from '../lib/payment-methods';
import { makeErrorResponse } from '../lib/payment-processors';
import { useFormStatus, FormStatus, useProcessPayment } from '../public-api';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { useHandlePaymentProcessorResponse } from './use-process-payment';
import type { PaymentMethod, PaymentProcessorSubmitData, ProcessPayment } from '../types';

const CheckoutSubmitButtonWrapper = styled.div`
	& > button {
		height: 50px;
	}

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
	const handlePaymentProcessorPromise = useHandlePaymentProcessorResponse();
	const [ activePaymentMethodId ] = usePaymentMethodId();
	const isActive = paymentMethod.id === activePaymentMethodId;
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = disabled || formStatus !== FormStatus.READY || ! isActive;
	const onClick = useProcessPayment( paymentMethod?.paymentProcessorId ?? '' );
	const onClickWithValidation: ProcessPayment = async (
		processorData: PaymentProcessorSubmitData
	) => {
		if ( ! isActive ) {
			const rejection = Promise.resolve(
				makeErrorResponse( __( 'This payment method is not currently available.' ) )
			);
			handlePaymentProcessorPromise( paymentMethod.id, rejection );
			return rejection;
		}

		if ( validateForm ) {
			return validateForm().then( ( validationResult: boolean ) => {
				if ( validationResult ) {
					return onClick( processorData );
				}
				// Take no action if the form is not valid. User notification should be
				// handled inside the validation callback itself but we will return a
				// generic error message here in case something needs it.
				return Promise.resolve(
					makeErrorResponse( __( 'The information requried by this payment method is not valid.' ) )
				);
			} );
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
