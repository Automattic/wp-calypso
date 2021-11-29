import { createContext } from 'react';
import {
	StepChangedCallback,
	CheckoutPageErrorCallback,
	FormStatus,
	PaymentMethod,
	PaymentProcessorProp,
	ReactStandardAction,
	TransactionStatusManager,
} from '../types';

interface CheckoutContext {
	allPaymentMethods: PaymentMethod[];
	paymentMethodId: string | null;
	setPaymentMethodId: ( id: string ) => void;
	onEvent: ( action: ReactStandardAction ) => void;
	formStatus: FormStatus;
	setFormStatus: ( newStatus: FormStatus ) => void;
	transactionStatusManager: TransactionStatusManager | null;
	paymentProcessors: PaymentProcessorProp;
	onPageLoadError?: CheckoutPageErrorCallback;
	onStepChanged?: StepChangedCallback;
}

const defaultCheckoutContext: CheckoutContext = {
	allPaymentMethods: [],
	paymentMethodId: null,
	setPaymentMethodId: noop,
	onEvent: noop,
	formStatus: FormStatus.LOADING,
	setFormStatus: noop,
	transactionStatusManager: null,
	paymentProcessors: {},
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
