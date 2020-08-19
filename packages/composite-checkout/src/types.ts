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
	theme?: object;
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
	redirectToUrl: ( url: string ) => void;
	paymentProcessors: PaymentProcessorProp;
	isValidating?: boolean;
}

export interface PaymentProcessorProp {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[ key: string ]: ( ...args: any[] ) => void;
}
