import Button from './components/button';
import CheckoutErrorBoundary from './components/checkout-error-boundary';
import CheckoutModal from './components/checkout-modal';
import CheckoutOrderSummaryStep, {
	CheckoutOrderSummary,
	CheckoutOrderSummaryStepTitle,
} from './components/checkout-order-summary';
import CheckoutPaymentMethods from './components/checkout-payment-methods';
import { CheckoutProvider } from './components/checkout-provider';
import {
	Checkout,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	useIsStepActive,
	useIsStepComplete,
	useSetStepComplete,
	MainContentWrapper,
	CheckoutStepAreaWrapper,
	SubmitButtonWrapper,
} from './components/checkout-steps';
import CheckoutSubmitButton from './components/checkout-submit-button';
import {
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	getDefaultOrderReviewStep,
} from './components/default-steps';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './components/order-review-line-items';
import RadioButton from './components/radio-button';
import { CheckIcon as CheckoutCheckIcon } from './components/shared-icons';
import useProcessPayment from './components/use-process-payment';
import { useFormStatus } from './lib/form-status';
import InvalidPaymentProcessorResponseError from './lib/invalid-payment-processor-response-error';
import { useLineItems, useTotal, useLineItemsOfType } from './lib/line-items';
import { usePaymentMethod, usePaymentMethodId, useAllPaymentMethods } from './lib/payment-methods';
import PaymentLogo from './lib/payment-methods/payment-logo';
import {
	usePaymentProcessor,
	usePaymentProcessors,
	makeManualResponse,
	makeSuccessResponse,
	makeRedirectResponse,
	makeErrorResponse,
} from './lib/payment-processors';
import checkoutTheme from './lib/theme';
import { useTransactionStatus } from './lib/transaction-status';
export * from './types';

export type { Theme } from './lib/theme';

// Re-export the public API
export {
	Button,
	Checkout,
	CheckoutCheckIcon,
	CheckoutErrorBoundary,
	CheckoutModal,
	CheckoutOrderSummary,
	CheckoutOrderSummaryStep,
	CheckoutOrderSummaryStepTitle,
	CheckoutPaymentMethods,
	CheckoutProvider,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutStepAreaWrapper,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutSubmitButton,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	InvalidPaymentProcessorResponseError,
	MainContentWrapper,
	OrderReviewLineItems,
	OrderReviewSection,
	OrderReviewTotal,
	PaymentLogo,
	RadioButton,
	SubmitButtonWrapper,
	checkoutTheme,
	getDefaultOrderReviewStep,
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	makeErrorResponse,
	makeManualResponse,
	makeRedirectResponse,
	makeSuccessResponse,
	useAllPaymentMethods,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useLineItems,
	useLineItemsOfType,
	usePaymentMethod,
	usePaymentMethodId,
	usePaymentProcessor,
	usePaymentProcessors,
	useProcessPayment,
	useSetStepComplete,
	useTotal,
	useTransactionStatus,
};
