import CheckoutPaymentMethods, { CheckoutPaymentMethodsTitle } from './checkout-payment-methods';
import type { CheckoutPageErrorCallback, CheckoutStepProps } from '../types';

export function getDefaultPaymentMethodStep( {
	onPageLoadError,
	waitForPaymentMethodIds = [],
}: {
	onPageLoadError?: CheckoutPageErrorCallback;
	waitForPaymentMethodIds?: string[];
} ): CheckoutStepProps {
	return {
		stepId: 'payment-method-step',
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
	};
}
