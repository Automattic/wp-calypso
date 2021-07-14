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
import useEvents from './components/use-events';
import useMessages from './components/use-messages';
import useProcessPayment from './components/use-process-payment';
import { useFormStatus } from './lib/form-status';
import InvalidPaymentProcessorResponseError from './lib/invalid-payment-processor-response-error';
import { useLineItems, useTotal, useLineItemsOfType } from './lib/line-items';
import { usePaymentMethod, usePaymentMethodId, useAllPaymentMethods } from './lib/payment-methods';
import { createAlipayPaymentMethodStore, createAlipayMethod } from './lib/payment-methods/alipay';
import { createExistingCardMethod } from './lib/payment-methods/existing-credit-card';
import { createIdealPaymentMethodStore, createIdealMethod } from './lib/payment-methods/ideal';
import PaymentLogo from './lib/payment-methods/payment-logo';
import { createSofortPaymentMethodStore, createSofortMethod } from './lib/payment-methods/sofort';
import {
	createStripeMethod,
	createStripePaymentMethodStore,
} from './lib/payment-methods/stripe-credit-card-fields';
import {
	usePaymentProcessor,
	usePaymentProcessors,
	makeManualResponse,
	makeSuccessResponse,
	makeRedirectResponse,
	makeErrorResponse,
} from './lib/payment-processors';
import {
	createRegistry,
	defaultRegistry,
	registerStore,
	useDispatch,
	useRegisterStore,
	useRegistry,
	useSelect,
} from './lib/registry';
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
	createAlipayMethod,
	createAlipayPaymentMethodStore,
	createExistingCardMethod,
	createIdealMethod,
	createIdealPaymentMethodStore,
	createRegistry,
	createSofortMethod,
	createSofortPaymentMethodStore,
	createStripeMethod,
	createStripePaymentMethodStore,
	defaultRegistry,
	getDefaultOrderReviewStep,
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	makeErrorResponse,
	makeManualResponse,
	makeRedirectResponse,
	makeSuccessResponse,
	registerStore,
	useAllPaymentMethods,
	useDispatch,
	useEvents,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useLineItems,
	useLineItemsOfType,
	useMessages,
	usePaymentMethod,
	usePaymentMethodId,
	usePaymentProcessor,
	usePaymentProcessors,
	useProcessPayment,
	useRegisterStore,
	useRegistry,
	useSelect,
	useSetStepComplete,
	useTotal,
	useTransactionStatus,
};
