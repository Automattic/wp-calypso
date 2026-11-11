import CheckoutPaymentMethods, { CheckoutPaymentMethodsTitle } from './checkout-payment-methods';
import type { CheckoutPageErrorCallback, CheckoutStepProps } from '../types';

// Exported so consumers (e.g. a payment method's own submit button) can
// scroll this step into view without duplicating the id.
export const PAYMENT_METHOD_STEP_ID = 'payment-method-step';

export function getDefaultPaymentMethodStep( {
	onPageLoadError,
	waitForPaymentMethodIds = [],
}: {
	onPageLoadError?: CheckoutPageErrorCallback;
	waitForPaymentMethodIds?: string[];
} ): CheckoutStepProps {
	return {
		stepId: PAYMENT_METHOD_STEP_ID,
		isCompleteCallback: () => true,
		className: 'checkout__payment-method-step',
		titleContent: <CheckoutPaymentMethodsTitle />,
		activeStepContent: (
			<CheckoutPaymentMethods
				onPageLoadError={ onPageLoadError }
				isComplete={ false }
				waitForPaymentMethodIds={ waitForPaymentMethodIds }
			/>
		),
		completeStepContent: <CheckoutPaymentMethods summary isComplete />,
		skipValidationOnSubmit: true,
	};
}
