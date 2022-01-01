import { createContext } from 'react';
import {
	CheckoutPageErrorCallback,
	FormStatus,
	PaymentMethod,
	TransactionStatusManager,
	PaymentMethodChangedCallback,
} from '../types';

interface CheckoutContext {
	allPaymentMethods: PaymentMethod[];
	paymentMethodId: string | null;
	setPaymentMethodId: ( id: string ) => void;
	formStatus: FormStatus;
	setFormStatus: ( newStatus: FormStatus ) => void;
	transactionStatusManager: TransactionStatusManager | null;
	onPageLoadError?: CheckoutPageErrorCallback;
	onPaymentMethodChanged?: PaymentMethodChangedCallback;
}

const defaultCheckoutContext: CheckoutContext = {
	allPaymentMethods: [],
	paymentMethodId: null,
	setPaymentMethodId: noop,
	formStatus: FormStatus.LOADING,
	setFormStatus: noop,
	transactionStatusManager: null,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
