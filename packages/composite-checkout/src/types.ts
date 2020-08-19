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

export interface FormStatusManager {
	formStatus: string;
	setFormReady: () => void;
	setFormLoading: () => void;
	setFormValidating: () => void;
	setFormSubmitting: () => void;
	setFormComplete: () => void;
}

export interface ReactStandardAction {
	type: string;
	payload?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
