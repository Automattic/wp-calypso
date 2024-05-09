import CheckoutPaymentMethods, { CheckoutPaymentMethodsTitle } from './checkout-payment-methods';
import type { CheckoutStepProps } from '../types';

export function getDefaultPaymentMethodStep(): CheckoutStepProps {
	return {
		stepId: 'payment-method-step',
		isCompleteCallback: () => true,
		className: 'checkout__payment-method-step',
		titleContent: <CheckoutPaymentMethodsTitle />,
		activeStepContent: <CheckoutPaymentMethods isComplete={ false } />,
		completeStepContent: <CheckoutPaymentMethods summary isComplete />,
	};
}
