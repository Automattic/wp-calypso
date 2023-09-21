import Button from './components/button';
import CheckoutErrorBoundary from './components/checkout-error-boundary';
import CheckoutModal from './components/checkout-modal';
import CheckoutPaymentMethods from './components/checkout-payment-methods';
import { CheckoutProvider } from './components/checkout-provider';
import {
	CheckoutFormSubmit,
	CheckoutStep,
	CheckoutStepBody,
	CheckoutStepGroup,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	PaymentMethodStep,
	SubmitButtonWrapper,
	useIsStepActive,
	useIsStepComplete,
	useSetStepComplete,
	createCheckoutStepGroupStore,
} from './components/checkout-steps';
import CheckoutSubmitButton from './components/checkout-submit-button';
import LoadingContent from './components/loading-content';
import useProcessPayment from './components/use-process-payment';
import { useFormStatus } from './lib/form-status';
import { useTotal } from './lib/line-items';
import {
	usePaymentMethod,
	usePaymentMethodId,
	useAllPaymentMethods,
	useAvailablePaymentMethodIds,
	useTogglePaymentMethod,
} from './lib/payment-methods';
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
	CheckoutErrorBoundary,
	CheckoutFormSubmit,
	CheckoutModal,
	CheckoutPaymentMethods,
	CheckoutProvider,
	CheckoutStep,
	CheckoutStepBody,
	CheckoutStepGroup,
	CheckoutSubmitButton,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	LoadingContent,
	PaymentLogo,
	PaymentMethodStep,
	SubmitButtonWrapper,
	checkoutTheme,
	createCheckoutStepGroupStore,
	makeErrorResponse,
	makeManualResponse,
	makeRedirectResponse,
	makeSuccessResponse,
	useAllPaymentMethods,
	useAvailablePaymentMethodIds,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	usePaymentMethod,
	usePaymentMethodId,
	usePaymentProcessor,
	usePaymentProcessors,
	useProcessPayment,
	useSetStepComplete,
	useTogglePaymentMethod,
	useTotal,
	useTransactionStatus,
};
