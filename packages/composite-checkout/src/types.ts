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
