// Payment method slugs
export type CheckoutPaymentMethodSlug =
	| 'card'
	| 'existingCard'
	| 'existingPayPalPPCP'
	| 'paypal-express'
	| 'paypal-js'
	| 'free-purchase'
	| string;

// WPCOM payment method class names
export type WPCOMPaymentMethod =
	| 'WPCOM_Billing_Stripe_Payment_Method'
	| 'WPCOM_Billing_MoneyPress_Stored'
	| 'WPCOM_Billing_PayPal_Express'
	| 'WPCOM_Billing_PayPal_PPCP'
	| 'WPCOM_Billing_WPCOM'
	| string;

// Managed contact details
export interface ManagedValue {
	value: string;
	isTouched: boolean;
	errors: string[];
}

export interface ManagedContactDetails {
	firstName?: ManagedValue;
	lastName?: ManagedValue;
	organization?: ManagedValue;
	email?: ManagedValue;
	alternateEmail?: ManagedValue;
	phone?: ManagedValue;
	phoneNumberCountry?: ManagedValue;
	address1?: ManagedValue;
	address2?: ManagedValue;
	city?: ManagedValue;
	state?: ManagedValue;
	postalCode?: ManagedValue;
	countryCode?: ManagedValue;
	fax?: ManagedValue;
	vatId?: ManagedValue;
	tldExtraFields?: Record< string, ManagedValue >;
}
