import CheckoutOrderSummaryStep, {
	CheckoutOrderSummaryStepTitle,
	CheckoutOrderSummary,
} from './checkout-order-summary';
import CheckoutPaymentMethods, { CheckoutPaymentMethodsTitle } from './checkout-payment-methods';
import CheckoutReviewOrder, { CheckoutReviewOrderTitle } from './checkout-review-order';
import type { CheckoutStepProps, OrderSummaryData } from '../types';

export function getDefaultOrderSummary(): OrderSummaryData {
	return {
		className: 'checkout__order-summary',
		summaryContent: <CheckoutOrderSummary />,
	};
}

export function getDefaultOrderSummaryStep(): CheckoutStepProps {
	return {
		stepId: 'order-summary-step',
		isCompleteCallback: () => true,
		className: 'checkout__order-summary-step',
		titleContent: <CheckoutOrderSummaryStepTitle />,
		activeStepContent: null,
		completeStepContent: <CheckoutOrderSummaryStep />,
	};
}

export function getDefaultPaymentMethodStep(): CheckoutStepProps {
	return {
		stepId: 'payment-method-step',
		isCompleteCallback: () => true,
		className: 'checkout__payment-method-step',
		titleContent: <CheckoutPaymentMethodsTitle />,
		activeStepContent: <CheckoutPaymentMethods isComplete={ false } />,
		completeStepContent: <CheckoutPaymentMethods summary isComplete={ true } />,
	};
}

export function getDefaultOrderReviewStep(): CheckoutStepProps {
	return {
		stepId: 'order-review-step',
		isCompleteCallback: () => true,
		className: 'checkout__review-order-step',
		titleContent: <CheckoutReviewOrderTitle />,
		activeStepContent: <CheckoutReviewOrder />,
		completeStepContent: null,
	};
}
