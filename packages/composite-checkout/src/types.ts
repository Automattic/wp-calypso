import '@emotion/react';
import { ReactElement } from 'react';
import { Theme as ThemeType } from './lib/theme';

declare module '@emotion/react' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface Theme extends ThemeType {}
}

export interface CheckoutStepProps {
	stepId: string;
	titleContent: React.ReactNode;
	isCompleteCallback: IsCompleteCallback;
	activeStepContent?: React.ReactNode;
	completeStepContent?: React.ReactNode;
	className?: string;
	editButtonText?: string;
	editButtonAriaLabel?: string;
	nextStepButtonText?: string;
	nextStepButtonAriaLabel?: string;
	validatingButtonText?: string;
	validatingButtonAriaLabel?: string;
}

export type IsCompleteCallback = () => boolean | Promise< boolean >;

export interface OrderSummaryData {
	className: string;
	summaryContent: React.ReactNode;
}

export interface PaymentMethod {
	id: string;
	label?: React.ReactNode;
	activeContent?: React.ReactNode;
	inactiveContent?: React.ReactNode;
	submitButton: ReactElement;
	getAriaLabel: ( localize: ( value: string ) => string ) => string;
}

export type ExternalPaymentMethod = Partial< PaymentMethod >;

export interface LineItem {
	id: string;
	type: string;
	label: string;
	sublabel?: string;
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
			payload?: P;
	  };

export interface CheckoutProviderProps {
	theme?: ThemeType;
	total?: LineItem;
	items?: LineItem[];
	paymentMethods: PaymentMethod[];
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	onPageLoadError?: CheckoutPageErrorCallback;
	onStepChanged?: StepChangedCallback;
	onPaymentMethodChanged?: PaymentMethodChangedCallback;
	isLoading?: boolean;
	redirectToUrl?: ( url: string ) => void;
	paymentProcessors: PaymentProcessorProp;
	isValidating?: boolean;
	initiallySelectedPaymentMethodId?: string | null;
	children: React.ReactNode;
}

export interface PaymentProcessorProp {
	[ key: string ]: PaymentProcessorFunction;
}

export type StepChangedCallback = ( args: StepChangedEventArguments ) => void;
export type PaymentMethodChangedCallback = ( method: string ) => void;
export type PaymentEventCallback = ( args: PaymentEventCallbackArguments ) => void;
export type PaymentErrorCallback = ( args: {
	paymentMethodId: string | null;
	transactionError: string | null;
} ) => void;
export type CheckoutPageErrorCallback = (
	errorType: string,
	errorMessage: string,
	errorData?: Record< string, string | number | undefined >
) => void;

export type StepChangedEventArguments = {
	stepNumber: number | null;
	previousStepNumber: number;
	paymentMethodId: string;
};

export type PaymentEventCallbackArguments = {
	paymentMethodId: string | null;
	transactionLastResponse: PaymentProcessorResponseData;
};

export type PaymentProcessorResponseData = unknown;

export type PaymentProcessorError = {
	type: PaymentProcessorResponseType.ERROR;
	payload: string;
};
export type PaymentProcessorSuccess = {
	type: PaymentProcessorResponseType.SUCCESS;
	payload: PaymentProcessorResponseData;
};
export type PaymentProcessorRedirect = {
	type: PaymentProcessorResponseType.REDIRECT;
	payload: string | undefined;
};
export type PaymentProcessorManual = {
	type: PaymentProcessorResponseType.MANUAL;
	payload: unknown;
};

export type PaymentProcessorResponse =
	| PaymentProcessorError
	| PaymentProcessorSuccess
	| PaymentProcessorRedirect
	| PaymentProcessorManual;

export type PaymentProcessorSubmitData = unknown;

export type PaymentProcessorFunction = (
	submitData: PaymentProcessorSubmitData
) => Promise< PaymentProcessorResponse >;

export enum PaymentProcessorResponseType {
	SUCCESS = 'SUCCESS',
	REDIRECT = 'REDIRECT',
	MANUAL = 'MANUAL',
	ERROR = 'ERROR',
}

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
	resetTransaction: ResetTransaction;
	setTransactionError: SetTransactionError;
	setTransactionComplete: SetTransactionComplete;
	setTransactionPending: SetTransactionPending;
	setTransactionRedirecting: SetTransactionRedirecting;
}

export type ProcessPayment = (
	paymentProcessorId: string,
	processorData: PaymentProcessorSubmitData
) => Promise< PaymentProcessorResponse >;

export type SetTransactionRedirecting = ( url: string ) => void;

export type SetTransactionPending = () => void;

export type SetTransactionComplete = ( response: PaymentProcessorResponseData ) => void;

export type SetTransactionError = ( message: string ) => void;

export type ResetTransaction = () => void;

export interface LineItemsState {
	items: LineItem[];
	total: LineItem;
}

export interface LineItemsProviderProps {
	items: LineItem[];
	total: LineItem;
}
