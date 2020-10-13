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

export enum FormStatus {
	LOADING = 'loading',
	READY = 'ready',
	SUBMITTING = 'submitting',
	VALIDATING = 'validating',
	COMPLETE = 'complete',
}

export interface FormStatusState {
	formStatus: FormStatus;
}

export type FormStatusAction = ReactStandardAction< 'FORM_STATUS_CHANGE', FormStatus >;

export interface FormStatusController extends FormStatusState {
	setFormReady: () => void;
	setFormLoading: () => void;
	setFormValidating: () => void;
	setFormSubmitting: () => void;
	setFormComplete: () => void;
}

export type FormStatusSetter = ( newStatus: FormStatus ) => void;

export type FormStatusManager = [ FormStatus, FormStatusSetter ];

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

export type PaymentProcessorResponseData = unknown;

export type PaymentProcessorResponse =
	| { type: 'SUCCESS'; payload: PaymentProcessorResponseData }
	| { type: 'NOOP' }
	| { type: 'REDIRECT'; payload: string };

export type PaymentProcessorFunction = (
	submitData: unknown
) => Promise< PaymentProcessorResponse >;

export enum TransactionStatus {
	NOT_STARTED = 'not-started',
	PENDING = 'pending',
	COMPLETE = 'complete',
	REDIRECTING = 'redirecting',
	ERROR = 'error',
}

export interface TransactionStatusState {
	transactionStatus: TransactionStatus;
	previousTransactionStatus: TransactionStatus;
	transactionLastResponse: PaymentProcessorResponseData | null;
	transactionError: string | null;
	transactionRedirectUrl: string | null;
}

export interface TransactionStatusPayloads {
	status: TransactionStatus;
	response?: PaymentProcessorResponseData;
	error?: string;
	url?: string;
}

export interface TransactionStatusPayloadNotStarted
	extends Pick< TransactionStatusPayloads, 'status' > {
	status: TransactionStatus.NOT_STARTED;
}

export interface TransactionStatusPayloadPending
	extends Pick< TransactionStatusPayloads, 'status' > {
	status: TransactionStatus.PENDING;
}

export interface TransactionStatusPayloadComplete
	extends Required< Pick< TransactionStatusPayloads, 'status' | 'response' > > {
	status: TransactionStatus.COMPLETE;
}

export interface TransactionStatusPayloadRedirecting
	extends Required< Pick< TransactionStatusPayloads, 'status' | 'url' > > {
	status: TransactionStatus.REDIRECTING;
}

export interface TransactionStatusPayloadError
	extends Required< Pick< TransactionStatusPayloads, 'status' | 'error' > > {
	status: TransactionStatus.ERROR;
}

export type TransactionStatusPayload =
	| TransactionStatusPayloadNotStarted
	| TransactionStatusPayloadPending
	| TransactionStatusPayloadComplete
	| TransactionStatusPayloadRedirecting
	| TransactionStatusPayloadError;

export type TransactionStatusAction = ReactStandardAction< 'STATUS_SET', TransactionStatusPayload >;

export interface TransactionStatusManager extends TransactionStatusState {
	resetTransaction: () => void;
	setTransactionError: ( message: string ) => void;
	setTransactionComplete: ( response: PaymentProcessorResponseData ) => void;
	setTransactionPending: () => void;
	setTransactionRedirecting: ( url: string ) => void;
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
