/**
 * External dependencies
 */
import { createContext } from 'react';
import {
	FormStatus,
	PaymentMethod,
	PaymentProcessorProp,
	ReactStandardAction,
	TransactionStatus,
	TransactionStatusManager,
} from '../types';

const defaultTransactionStatusManager: TransactionStatusManager = {
	transactionStatus: TransactionStatus.NOT_STARTED,
	previousTransactionStatus: TransactionStatus.NOT_STARTED,
	transactionError: null,
	transactionLastResponse: null,
	transactionRedirectUrl: null,
	resetTransaction: noop,
	setTransactionError: noop,
	setTransactionComplete: noop,
	setTransactionPending: noop,
	setTransactionRedirecting: noop,
};

interface CheckoutContext {
	allPaymentMethods: PaymentMethod[];
	paymentMethodId: string | null;
	setPaymentMethodId: ( id: string ) => void;
	showErrorMessage: ( message: string ) => void;
	showInfoMessage: ( message: string ) => void;
	showSuccessMessage: ( message: string ) => void;
	onEvent: ( action: ReactStandardAction ) => void;
	formStatus: FormStatus;
	setFormStatus: ( newStatus: FormStatus ) => void;
	transactionStatusManager: TransactionStatusManager;
	paymentProcessors: PaymentProcessorProp;
}

const defaultCheckoutContext: CheckoutContext = {
	allPaymentMethods: [],
	paymentMethodId: null,
	setPaymentMethodId: noop,
	showErrorMessage: noop,
	showInfoMessage: noop,
	showSuccessMessage: noop,
	onEvent: noop,
	formStatus: FormStatus.LOADING,
	setFormStatus: noop,
	transactionStatusManager: defaultTransactionStatusManager,
	paymentProcessors: {},
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
