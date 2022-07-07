export type DateFormat = 'ISO-8601';

export interface PaymentDetails {
	cardHolder: string;
	cardNumber: string;
	expiryMonth: string;
	expiryYear: string;
	cvv: string;
	countryCode: string;
	postalCode: string;
}

export interface RegistrarDetails {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	countryCode: string;
	address: string;
	city: string;
	stateCode: string;
	postalCode: string;
}

export interface NewTestUserDetails {
	username: string;
	password: string;
	email: string;
	siteName: string;
	inboxId: string;
}

export interface AccountCredentials {
	username: string;
	password: string;
	totpKey?: string;
}
