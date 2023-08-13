import { createContext } from 'react';
import {
	StepChangedCallback,
	CheckoutPageErrorCallback,
	PaymentMethod,
	PaymentProcessorProp,
	TransactionStatusManager,
	PaymentMethodChangedCallback,
} from '../types';

export interface CheckoutContextInterface {
	allPaymentMethods: PaymentMethod[];
	disabledPaymentMethodIds: string[];
	setDisabledPaymentMethodIds: ( methods: string[] ) => void;
	paymentMethodId: string | null;
	setPaymentMethodId: ( id: string ) => void;
	transactionStatusManager: TransactionStatusManager | null;
	paymentProcessors: PaymentProcessorProp;
	onPageLoadError?: CheckoutPageErrorCallback;
	onStepChanged?: StepChangedCallback;
	onPaymentMethodChanged?: PaymentMethodChangedCallback;
}

const defaultCheckoutContext: CheckoutContextInterface = {
	allPaymentMethods: [],
	disabledPaymentMethodIds: [],
	setDisabledPaymentMethodIds: noop,
	paymentMethodId: null,
	setPaymentMethodId: noop,
	transactionStatusManager: null,
	paymentProcessors: {},
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
