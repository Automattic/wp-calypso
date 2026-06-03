import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { cloneElement, useCallback } from 'react';
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
	expressPaymentMethodIds = [],
}: {
	validateForm?: () => Promise< boolean >;
	className?: string;
	disabled?: boolean;
	onLoadError?: ( error: Error ) => void;
	expressPaymentMethodIds?: string[];
} ) {
	const paymentMethods = useAllPaymentMethods();

	const isExpress = ( paymentMethod: PaymentMethod ) =>
		expressPaymentMethodIds.includes( paymentMethod.id );

	// Render express-eligible methods first so they stack above the active
	// method's button in the sidebar. Relative order within each group is
	// preserved. When expressPaymentMethodIds is empty this is a no-op.
	const orderedPaymentMethods = [
		...paymentMethods.filter( isExpress ),
		...paymentMethods.filter( ( paymentMethod ) => ! isExpress( paymentMethod ) ),
	];

	return (
		<>
			{ orderedPaymentMethods.map( ( paymentMethod ) => {
				return (
					<CheckoutSubmitButtonForPaymentMethod
						key={ paymentMethod.id }
						paymentMethod={ paymentMethod }
						isExpress={ isExpress( paymentMethod ) }
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
	isExpress,
	validateForm,
	className,
	disabled,
	onLoadError,
}: {
	paymentMethod: PaymentMethod;
	isExpress: boolean;
	validateForm?: () => Promise< boolean >;
	className?: string;
	disabled?: boolean;
	onLoadError?: ( error: Error ) => void;
} ) {
	const handlePaymentProcessorPromise = useHandlePaymentProcessorResponse();
	const [ activePaymentMethodId ] = usePaymentMethodId();
	const isActive = paymentMethod.id === activePaymentMethodId;
	// Express methods are shown and clickable even when they are not the
	// actively-selected method, so the sidebar can offer them as one-tap
	// alternatives. Non-express methods only show when active (the others stay
	// hidden via the --inactive class).
	const isShown = isActive || isExpress;
	const { formStatus } = useFormStatus();
	const { __ } = useI18n();
	const isDisabled = disabled || formStatus !== FormStatus.READY || ! isShown;
	const onClick = useProcessPayment( paymentMethod?.paymentProcessorId ?? '' );
	const onClickWithValidation: ProcessPayment = async (
		processorData: PaymentProcessorSubmitData
	) => {
		if ( ! isShown ) {
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

	// Add payment method to any errors that get logged.
	const onLoadErrorWithPaymentMethodId = useCallback(
		( error: Error ) => {
			if ( ! onLoadError ) {
				return;
			}
			const errorWithCause = new Error(
				`Error while rendering submit button for payment method '${ paymentMethod.id }': ${ error.message } (${ error.name })`,
				{ cause: error }
			);
			onLoadError( errorWithCause );
		},
		[ onLoadError, paymentMethod.id ]
	);

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
			onError={ onLoadErrorWithPaymentMethodId }
		>
			<CheckoutSubmitButtonWrapper
				className={ joinClasses( [
					className,
					'checkout-submit-button',
					isShown ? 'checkout-submit-button--active' : 'checkout-submit-button--inactive',
				] ) }
			>
				{ clonedSubmitButton }
			</CheckoutSubmitButtonWrapper>
		</CheckoutErrorBoundary>
	);
}
