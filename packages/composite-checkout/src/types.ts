/**
 * External dependencies
 */
import { DataRegistry } from '@wordpress/data';

export interface PaymentMethod {
	id: string;
	label: React.ReactNode;
	activeContent: React.ReactNode;
	inactiveContent: React.ReactNode;
	submitButton: React.ReactNode;
	getAriaLabel: ( localize: ( value: string ) => string ) => string;
}

export interface LineItem {
	id: string;
	type: string;
	label: string;
	subLabel?: string;
	amount: LineItemAmount;
}

export interface LineItemAmount {
	currency: string;
	value: number;
	displayValue: string;
}

export interface FormStatusController {
	formStatus: string;
	setFormReady: () => void;
	setFormLoading: () => void;
	setFormValidating: () => void;
	setFormSubmitting: () => void;
	setFormComplete: () => void;
}

export type FormStatusManager = [ string, ( newStatus: string ) => void ];

export interface ReactStandardAction {
	type: string;
	payload?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface CheckoutProviderProps {
	theme?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	registry?: DataRegistry;
	total: LineItem;
	items: LineItem[];
	paymentMethods: PaymentMethod[];
	onPaymentComplete: ( { paymentMethodId }: { paymentMethodId: string | null } ) => void;
	showErrorMessage: ( message: string ) => void;
	showInfoMessage: ( message: string ) => void;
	showSuccessMessage: ( message: string ) => void;
	onEvent?: ( event: ReactStandardAction ) => void;
	isLoading?: boolean;
	redirectToUrl?: ( url: string ) => void;
	paymentProcessors: PaymentProcessorProp;
	isValidating?: boolean;
}

export interface PaymentProcessorProp {
	[ key: string ]: PaymentProcessorFunction;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PaymentProcessorFunction = ( ...args: any[] ) => void;

export interface TransactionStatus {
	transactionStatus: string;
	previousTransactionStatus: string;
	transactionLastResponse: object | null;
	transactionError: string | null;
	transactionRedirectUrl: string | null;
}

export interface TransactionStatusManager {
	transactionStatus: string;
	previousTransactionStatus: string;
	transactionError: string | null;
	transactionLastResponse: object | null;
	transactionRedirectUrl: string | null;
	resetTransaction: () => void;
	setTransactionError: ( message: string ) => void;
	setTransactionComplete: ( response: object ) => void;
	setTransactionPending: () => void;
	setTransactionRedirecting: ( url: string ) => void;
	setTransactionAuthorizing: ( response: object ) => void;
}

export interface LineItemsState {
	items: LineItem[];
	total: LineItem;
}

export interface LineItemsProviderProps {
	items: LineItem[];
	total: LineItem;
}
