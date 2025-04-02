import '@emotion/react';
import type { SubscriptionManager } from './lib/subscription-manager';
import type { Theme as ThemeType } from './lib/theme';
import type { ReactElement } from 'react';

declare module '@emotion/react' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface Theme extends ThemeType {}
}

export interface CheckoutStepProps {
	stepId: string;
	titleContent: React.ReactNode;
	isCompleteCallback: IsCompleteCallback;
	activeStepContent?: React.ReactNode;
	activeStepFooter?: React.ReactNode;
	activeStepHeader?: React.ReactNode;
	completeStepContent?: React.ReactNode;
	className?: string;
	canEditStep?: boolean;
	editButtonText?: string;
	editButtonAriaLabel?: string;
	nextStepButtonText?: string;
	nextStepButtonAriaLabel?: string;
	validatingButtonText?: string;
	validatingButtonAriaLabel?: string;
}

export type IsCompleteCallback = () => boolean | Promise< boolean >;

export type StepCompleteCallback = () => Promise< boolean >;

export interface PaymentMethodSubmitButtonProps {
	disabled?: boolean;
	onClick?: ProcessPayment;
}

export interface PaymentMethod {
	id: string;
	paymentProcessorId: string;
	label?: React.ReactNode;
	activeContent?: React.ReactNode;
	inactiveContent?: React.ReactNode;
	submitButton: ReactElement< PaymentMethodSubmitButtonProps >;
	getAriaLabel: ( localize: ( value: string ) => string ) => string;
	hasRequiredFields?: boolean;
	isInitiallyDisabled?: boolean;
}

export type ExternalPaymentMethod = Partial< PaymentMethod >;

export interface FormAndTransactionStatus {
	formStatus: FormStatus;
	transactionStatus: TransactionStatusState;
}

export enum FormStatus {
	LOADING = 'loading',
	READY = 'ready',
	SUBMITTING = 'submitting',
	VALIDATING = 'validating',
}

export interface FormStatusState {
	formStatus: FormStatus;
}

export type FormAndTransactionStatusAction = FormStatusAction | TransactionStatusAction;

export type FormStatusAction = ReactStandardAction< 'FORM_STATUS_CHANGE', FormStatus >;

export interface FormStatusController extends FormStatusState {
	setFormReady: () => void;
	setFormLoading: () => void;
	setFormValidating: () => void;
	setFormSubmitting: () => void;
}

export type FormStatusSetter = ( newStatus: FormStatus ) => void;

export type FormAndTransactionStatusManager = FormStatusManager & TransactionStatusManager;

export type FormStatusManager = {
	formStatus: FormStatus;
	setFormStatus: FormStatusSetter;
};

export interface PaymentMethodProviderContextInterface {
	allPaymentMethods: PaymentMethod[];
	paymentProcessors: PaymentProcessorProp;
	disabledPaymentMethodIds: string[];
	setDisabledPaymentMethodIds: ( methods: string[] ) => void;
	paymentMethodId: string | null | undefined;
	setPaymentMethodId: ( id: string ) => void;
	onPaymentMethodChanged?: PaymentMethodChangedCallback;
}

export interface CheckoutContextInterface {
	onPageLoadError?: CheckoutPageErrorCallback;
}

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
	selectFirstAvailablePaymentMethod?: boolean;
	children: React.ReactNode;
}

export interface PaymentProcessorProp {
	[ key: string ]: PaymentProcessorFunction;
}

export type StepChangedCallback = ( args: StepChangedEventArguments ) => void;
export type PaymentMethodChangedCallback = ( method: string ) => void;
export type PaymentEventCallback = ( args: PaymentEventCallbackArguments ) => void;
export type PaymentErrorCallback = ( args: {
	paymentMethodId: string | null | undefined;
	transactionError: string | null;
} ) => void;
export type CheckoutPageErrorCallback = (
	errorType: string,
	error: Error,
	errorData?: Record< string, string | number | undefined >
) => void;

export type StepChangedEventArguments = {
	stepNumber: number | null;
	previousStepNumber: number;
	paymentMethodId: string;
};

export type PaymentEventCallbackArguments = {
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

export type PaymentProcessorResponse =
	| PaymentProcessorError
	| PaymentProcessorSuccess
	| PaymentProcessorRedirect;

export type PaymentProcessorSubmitData = unknown;

export type PaymentProcessorFunction = (
	submitData: PaymentProcessorSubmitData
) => Promise< PaymentProcessorResponse >;

export enum PaymentProcessorResponseType {
	SUCCESS = 'SUCCESS',
	REDIRECT = 'REDIRECT',
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

export type TransactionStatusAction = ReactStandardAction<
	'TRANSACTION_STATUS_CHANGE',
	TransactionStatusPayload
>;

export interface TransactionStatusManager extends TransactionStatusState {
	resetTransaction: ResetTransaction;
	setTransactionError: SetTransactionError;
	setTransactionComplete: SetTransactionComplete;
	setTransactionPending: SetTransactionPending;
	setTransactionRedirecting: SetTransactionRedirecting;
}

export type ProcessPayment = (
	processorData: PaymentProcessorSubmitData
) => Promise< PaymentProcessorResponse >;

export type SetTransactionRedirecting = ( url: string ) => void;

export type SetTransactionPending = () => void;

export type SetTransactionComplete = ( response: PaymentProcessorResponseData ) => void;

export type SetTransactionError = ( message: string ) => void;

export type ResetTransaction = () => void;

export type StepIdMap = Record< string, number >;

export type StepCompleteCallbackMap = Record< string, StepCompleteCallback >;

export type SetStepComplete = ( stepId: string ) => Promise< boolean >;

export type MakeStepActive = ( stepId: string ) => Promise< boolean >;

export type CheckoutStepCompleteStatus = Record< string, boolean >;

export interface CheckoutStepGroupStore {
	state: CheckoutStepGroupState;
	actions: CheckoutStepGroupActions;
	subscription: SubscriptionManager;
}

export interface CheckoutStepGroupState {
	activeStepNumber: number;
	totalSteps: number;
	stepCompleteStatus: CheckoutStepCompleteStatus;
	stepIdMap: StepIdMap;
	stepCompleteCallbackMap: StepCompleteCallbackMap;
}

export interface CheckoutStepGroupActions {
	setActiveStepNumber: ( stepNumber: number ) => void;
	setStepCompleteStatus: ( newStatus: CheckoutStepCompleteStatus ) => void;
	setStepComplete: SetStepComplete;
	makeStepActive: MakeStepActive;
	getStepNumberFromId: ( stepId: string ) => number | undefined;
	setStepCompleteCallback: (
		stepNumber: number,
		stepId: string,
		callback: StepCompleteCallback
	) => void;
	getStepCompleteCallback: ( stepNumber: number ) => StepCompleteCallback;
	setTotalSteps: ( totalSteps: number ) => void;
}

export type TogglePaymentMethod = ( paymentMethodId: string, available: boolean ) => void;
