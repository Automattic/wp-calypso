/**
 * Internal dependencies
 */
import Button from './components/button';
import CheckoutErrorBoundary from './components/checkout-error-boundary';
import PaymentLogo from './lib/payment-methods/payment-logo';
import { CheckoutProvider } from './components/checkout-provider';
import useMessages from './components/use-messages';
import useEvents from './components/use-events';
import CheckoutSubmitButton from './components/checkout-submit-button';
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
import CheckoutPaymentMethods from './components/checkout-payment-methods';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './components/order-review-line-items';
import CheckoutModal from './components/checkout-modal';
import { usePaymentMethod, usePaymentMethodId, useAllPaymentMethods } from './lib/payment-methods';
import { useLineItems, useTotal, useLineItemsOfType } from './lib/line-items';
import {
	createRegistry,
	defaultRegistry,
	registerStore,
	useDispatch,
	useRegisterStore,
	useRegistry,
	useSelect,
} from './lib/registry';
import { createIdealPaymentMethodStore, createIdealMethod } from './lib/payment-methods/ideal';
import { createSofortPaymentMethodStore, createSofortMethod } from './lib/payment-methods/sofort';
import { createAlipayPaymentMethodStore, createAlipayMethod } from './lib/payment-methods/alipay';
import { createP24PaymentMethodStore, createP24Method } from './lib/payment-methods/p24';
import { createEpsPaymentMethodStore, createEpsMethod } from './lib/payment-methods/eps';
import {
	createGiropayPaymentMethodStore,
	createGiropayMethod,
} from './lib/payment-methods/giropay';
import {
	createBancontactPaymentMethodStore,
	createBancontactMethod,
} from './lib/payment-methods/bancontact';
import {
	createStripeMethod,
	createStripePaymentMethodStore,
} from './lib/payment-methods/stripe-credit-card-fields';
import { createApplePayMethod } from './lib/payment-methods/apple-pay';
import { createPayPalMethod } from './lib/payment-methods/paypal';
import { createExistingCardMethod } from './lib/payment-methods/existing-credit-card';
import CheckoutOrderSummaryStep, {
	CheckoutOrderSummary,
	CheckoutOrderSummaryStepTitle,
} from './components/checkout-order-summary';
import {
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	getDefaultOrderReviewStep,
} from './components/default-steps';
import { useFormStatus } from './lib/form-status';
import { CheckIcon as CheckoutCheckIcon } from './components/shared-icons';
import { useTransactionStatus } from './lib/transaction-status';
import {
	usePaymentProcessor,
	usePaymentProcessors,
	makeManualResponse,
	makeSuccessResponse,
	makeRedirectResponse,
} from './lib/payment-processors';
import useCreatePaymentProcessorOnClick from './components/use-create-payment-processor-on-click';
import RadioButton from './components/radio-button';
import checkoutTheme from './lib/theme';
export * from './types';

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
	createApplePayMethod,
	createBancontactMethod,
	createBancontactPaymentMethodStore,
	createEpsMethod,
	createEpsPaymentMethodStore,
	createExistingCardMethod,
	createGiropayMethod,
	createGiropayPaymentMethodStore,
	createIdealMethod,
	createIdealPaymentMethodStore,
	createP24Method,
	createP24PaymentMethodStore,
	createPayPalMethod,
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
	makeManualResponse,
	makeRedirectResponse,
	makeSuccessResponse,
	registerStore,
	useAllPaymentMethods,
	useCreatePaymentProcessorOnClick,
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
	useRegisterStore,
	useRegistry,
	useSelect,
	useSetStepComplete,
	useTotal,
	useTransactionStatus,
};
