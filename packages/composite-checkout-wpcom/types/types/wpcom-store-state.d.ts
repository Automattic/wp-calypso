interface ManagedValue {
	value: string;
	isTouched: boolean;
	errors: string[];
}
export declare function isValid( arg: ManagedValue ): boolean;
export declare type ManagedContactDetails = {
	firstName: ManagedValue;
	lastName: ManagedValue;
	organization: ManagedValue;
	email: ManagedValue;
	alternateEmail: ManagedValue;
	phone: ManagedValue;
	phoneNumberCountry: ManagedValue;
	address1: ManagedValue;
	address2: ManagedValue;
	city: ManagedValue;
	state: ManagedValue;
	postalCode: ManagedValue;
	countryCode: ManagedValue;
	fax: ManagedValue;
	vatId: ManagedValue;
};
export declare const defaultManagedContactDetails: ManagedContactDetails;
export declare function isCompleteAndValid( details: ManagedContactDetails ): boolean;
export declare type ManagedContactDetailsErrors = {
	firstName?: string[];
	lastName?: string[];
	organization?: string[];
	email?: string[];
	alternateEmail?: string[];
	phone?: string[];
	phoneNumberCountry?: string[];
	address1?: string[];
	address2?: string[];
	city?: string[];
	state?: string[];
	postalCode?: string[];
	countryCode?: string[];
	fax?: string[];
	vatId?: string[];
};
export declare type DomainContactDetails = {
	firstName: string;
	lastName: string;
	organization: string;
	email: string;
	alternateEmail: string;
	phone: string;
	address1: string;
	address2: string;
	city: string;
	state: string;
	postalCode: string;
	countryCode: string;
	fax: string;
};
export declare function prepareDomainContactDetails(
	details: ManagedContactDetails
): DomainContactDetails;
export declare type ManagedContactDetailsUpdaters = {
	updateDomainFields: (
		ManagedContactDetails: any,
		DomainContactDetails: any
	) => ManagedContactDetails;
	updatePhone: ( ManagedContactDetails: any, string: any ) => ManagedContactDetails;
	updatePhoneNumberCountry: ( ManagedContactDetails: any, string: any ) => ManagedContactDetails;
	updatePostalCode: ( ManagedContactDetails: any, string: any ) => ManagedContactDetails;
	updateCountryCode: ( ManagedContactDetails: any, string: any ) => ManagedContactDetails;
	updateVatId: ( ManagedContactDetails: any, string: any ) => ManagedContactDetails;
	setErrorMessages: (
		ManagedContactDetails: any,
		ManagedContactDetailsErrors: any
	) => ManagedContactDetails;
};
export declare const managedContactDetailsUpdaters: ManagedContactDetailsUpdaters;
export declare type WpcomStoreState = {
	siteId: string;
	contactDetails: ManagedContactDetails;
};
export declare const initialWpcomStoreState: WpcomStoreState;
export {};
