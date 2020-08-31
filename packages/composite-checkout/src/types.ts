/**
 * External dependencies
 */
import { DataRegistry } from '@wordpress/data';
import { ReactElement } from 'react';

/**
 * Internal dependencies
 */
import { Theme } from './lib/theme';

export interface PaymentMethod {
	id: string;
	label: React.ReactNode;
	activeContent: React.ReactNode;
	inactiveContent: React.ReactNode;
	submitButton: ReactElement;
	getAriaLabel: ( localize: ( value: string ) => string ) => string;
}

export type ExternalPaymentMethod = Partial< PaymentMethod >;

export interface LineItem {
	id: string;
	type: string;
	label: string;
	subLabel?: string;
	amount: LineItemAmount;
}

export type ExternalLineItem = Partial< LineItem >;

export interface TotalValidatedLineItem extends ExternalLineItem {
	label: LineItem[ 'label' ];
	amount: LineItem[ 'amount' ];
}

export interface LineItemAmount {
	currency: string;
	value: number;
	displayValue: string;
}

export type ExternalLineItemAmount = Partial< LineItemAmount >;

export interface FormStatusController {
	formStatus: string;
	setFormReady: () => void;
	setFormLoading: () => void;
	setFormValidating: () => void;
	setFormSubmitting: () => void;
	setFormComplete: () => void;
}

export type FormStatusManager = [ string, ( newStatus: string ) => void ];

export type ReactStandardAction< T = string, P = unknown > = P extends void
	? {
			type: T;
			payload?: P;
	  }
	: {
			type: T;
			payload: P;
	  };

export interface CheckoutProviderProps {
	theme?: Theme;
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

export interface TransactionStatusPayload {
	status: 'not-started' | 'pending' | 'complete' | 'authorizing' | 'error' | 'redirecting';
	response?: unknown | null;
	error?: string;
	url?: string;
}

export type TransactionStatusAction = ReactStandardAction< 'STATUS_SET', TransactionStatusPayload >;
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

export interface StripePaymentRequest {
	on: ( event: string, handler: StripePaymentRequestHandler ) => void;
	show: () => void;
}

export type StripePaymentRequestHandler = ( event: StripePaymentRequestHandlerEvent ) => void;

export interface StripePaymentRequestHandlerEvent {
	token?: {
		id: string;
		object: 'token';
	};
	paymentMethod?: {
		id: string;
		object: 'payment_method';
	};
	complete: () => void;
}
