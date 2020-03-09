/*
 * All child components in composite checkout are controlled -- they accept
 * data from their parents and evaluate callbacks when edited, rather than
 * managing their own state. Hooks providing this data in turn need some extra
 * data on each field: specifically whether it has been edited by the user
 * or passed validation. We wrap this extra data into an object type.
 */
interface ManagedValue {
	value: string;
	isTouched: boolean; // Has value been edited by the user?
	errors: string[]; // Has value passed validation?
	isRequired: boolean; // Is this field required?
}

export function isValid( arg: ManagedValue ): boolean {
	return arg.errors?.length <= 0 && ( arg.value?.length > 0 || ! arg.isRequired );
}

function getInitialManagedValue( initialProperties?: {
	value?: string;
	isTouched?: boolean;
	errors?: Array< string >;
	isRequired?: boolean;
} ): ManagedValue {
	return {
		value: '',
		isTouched: false,
		isRequired: false,
		errors: [],
		...initialProperties,
	};
}

function touchField( oldData: ManagedValue ): ManagedValue {
	return { ...oldData, isTouched: true };
}

function touchIfDifferent( newValue: string, oldData: ManagedValue ): ManagedValue {
	return newValue === oldData.value
		? oldData
		: { ...oldData, value: newValue, isTouched: true, errors: [] };
}

function setErrors( errors: string[] | undefined, oldData: ManagedValue ): ManagedValue {
	return undefined === errors ? { ...oldData, errors: [] } : { ...oldData, errors };
}

/*
 * The wpcom store hook stores an object with all the contact info
 * which is used to share state across fields where appropriate.
 * Each value keeps track of whether it has been edited and validated.
 */
export type ManagedContactDetails = {
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

export function isCompleteAndValid( details: ManagedContactDetails ): boolean {
	const values = Object.values( details );
	const result = values.length > 0 && values.every( isValid );
	return result;
}

export function isTouched( details: ManagedContactDetails ): boolean {
	const values = Object.values( details );
	return values.length > 0 && values.every( value => value.isTouched );
}

export function areRequiredFieldsNotEmpty( details: ManagedContactDetails ): boolean {
	const values = Object.values( details );
	return values.length > 0 && values.every( value => value.value.length > 0 || ! value.isRequired );
}

/*
 * List of error messages for each field.
 */
export type ManagedContactDetailsErrors = {
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

function setManagedContactDetailsErrors(
	errors: ManagedContactDetailsErrors,
	details: ManagedContactDetails
): ManagedContactDetails {
	return {
		firstName: setErrors( errors.firstName, details.firstName ),
		lastName: setErrors( errors.lastName, details.lastName ),
		organization: setErrors( errors.organization, details.organization ),
		email: setErrors( errors.email, details.email ),
		alternateEmail: setErrors( errors.alternateEmail, details.alternateEmail ),
		phone: setErrors( errors.phone, details.phone ),
		phoneNumberCountry: setErrors( errors.phoneNumberCountry, details.phoneNumberCountry ),
		address1: setErrors( errors.address1, details.address1 ),
		address2: setErrors( errors.address2, details.address2 ),
		city: setErrors( errors.city, details.city ),
		state: setErrors( errors.state, details.state ),
		postalCode: setErrors( errors.postalCode, details.postalCode ),
		countryCode: setErrors( errors.countryCode, details.countryCode ),
		fax: setErrors( errors.fax, details.fax ),
		vatId: setErrors( errors.vatId, details.vatId ),
	};
}

/*
 * The data model used in the ContactDetailsFormFields component.
 * This belongs in components/domains/contact-details-form-fields, but until
 * that component is rewritten in TypeScript we'll put it here.
 */
export type DomainContactDetails = {
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

export type DomainContactDetailsErrors = {
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
	alternateEmail?: string;
	phone?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	countryCode?: string;
	fax?: string;
};

/*
 * Convert a ManagedContactDetails object (used internally by the
 * WPCOM store state hook) into a DomainContactDetails object (used by
 * the ContactDetailsFormFields component)
 */
export function prepareDomainContactDetails(
	details: ManagedContactDetails
): DomainContactDetails {
	return {
		firstName: details.firstName.value,
		lastName: details.lastName.value,
		organization: details.organization.value,
		email: details.email.value,
		alternateEmail: details.alternateEmail.value,
		phone: details.phone.value,
		address1: details.address1.value,
		address2: details.address2.value,
		city: details.city.value,
		state: details.state.value,
		postalCode: details.postalCode.value,
		countryCode: details.countryCode.value,
		fax: details.fax.value,
	};
}

export function prepareDomainContactDetailsErrors(
	details: ManagedContactDetails
): DomainContactDetailsErrors {
	return {
		firstName: details.firstName.errors[ 0 ],
		lastName: details.lastName.errors[ 0 ],
		organization: details.organization.errors[ 0 ],
		email: details.email.errors[ 0 ],
		alternateEmail: details.alternateEmail.errors[ 0 ],
		phone: details.phone.errors[ 0 ],
		address1: details.address1.errors[ 0 ],
		address2: details.address2.errors[ 0 ],
		city: details.city.errors[ 0 ],
		state: details.state.errors[ 0 ],
		postalCode: details.postalCode.errors[ 0 ],
		countryCode: details.countryCode.errors[ 0 ],
		fax: details.fax.errors[ 0 ],
	};
}

/*
 * Helper type which bundles the field updaters in a single object
 * to help keep import lists under control. All updaters should
 * assume input came from the user.
 */
export type ManagedContactDetailsUpdaters = {
	updateDomainFields: ( ManagedContactDetails, DomainContactDetails ) => ManagedContactDetails;
	updatePhone: ( ManagedContactDetails, string ) => ManagedContactDetails;
	updatePhoneNumberCountry: ( ManagedContactDetails, string ) => ManagedContactDetails;
	updatePostalCode: ( ManagedContactDetails, string ) => ManagedContactDetails;
	updateCountryCode: ( ManagedContactDetails, string ) => ManagedContactDetails;
	touchContactFields: ( ManagedContactDetails ) => ManagedContactDetails;
	updateVatId: ( ManagedContactDetails, string ) => ManagedContactDetails;
	setErrorMessages: ( ManagedContactDetails, ManagedContactDetailsErrors ) => ManagedContactDetails;
};

export const managedContactDetailsUpdaters: ManagedContactDetailsUpdaters = {
	updateDomainFields: (
		oldDetails: ManagedContactDetails,
		newDetails: DomainContactDetails
	): ManagedContactDetails => {
		return {
			...oldDetails,
			firstName: touchIfDifferent( newDetails.firstName, oldDetails.firstName ),
			lastName: touchIfDifferent( newDetails.lastName, oldDetails.lastName ),
			organization: touchIfDifferent( newDetails.organization, oldDetails.organization ),
			email: touchIfDifferent( newDetails.email, oldDetails.email ),
			alternateEmail: touchIfDifferent( newDetails.alternateEmail, oldDetails.alternateEmail ),
			phone: touchIfDifferent( newDetails.phone, oldDetails.phone ),
			address1: touchIfDifferent( newDetails.address1, oldDetails.address1 ),
			address2: touchIfDifferent( newDetails.address2, oldDetails.address2 ),
			city: touchIfDifferent( newDetails.city, oldDetails.city ),
			state: touchIfDifferent( newDetails.state, oldDetails.state ),
			postalCode: touchIfDifferent( newDetails.postalCode, oldDetails.postalCode ),
			countryCode: touchIfDifferent( newDetails.countryCode, oldDetails.countryCode ),
			fax: touchIfDifferent( newDetails.fax, oldDetails.fax ),
		};
	},

	updatePhone: ( oldDetails: ManagedContactDetails, newPhone: string ): ManagedContactDetails => {
		return {
			...oldDetails,
			phone: touchIfDifferent( newPhone, oldDetails.phone ),
		};
	},

	updatePhoneNumberCountry: (
		oldDetails: ManagedContactDetails,
		newPhoneNumberCountry: string
	): ManagedContactDetails => {
		return {
			...oldDetails,
			phoneNumberCountry: touchIfDifferent( newPhoneNumberCountry, oldDetails.phoneNumberCountry ),
		};
	},

	updatePostalCode: (
		oldDetails: ManagedContactDetails,
		newPostalCode: string
	): ManagedContactDetails => {
		return {
			...oldDetails,
			postalCode: touchIfDifferent( newPostalCode, oldDetails.postalCode ),
		};
	},

	updateCountryCode: (
		oldDetails: ManagedContactDetails,
		newCountryCode: string
	): ManagedContactDetails => {
		return {
			...oldDetails,
			countryCode: touchIfDifferent( newCountryCode, oldDetails.countryCode ),
		};
	},

	touchContactFields: ( oldDetails: ManagedContactDetails ): ManagedContactDetails => {
		return Object.keys( oldDetails ).reduce( ( newDetails, detailKey ) => {
			return { ...newDetails, [ detailKey ]: touchField( oldDetails[ detailKey ] ) };
		}, oldDetails );
	},

	updateVatId: ( oldDetails: ManagedContactDetails, newVatId: string ): ManagedContactDetails => {
		return {
			...oldDetails,
			vatId: touchIfDifferent( newVatId, oldDetails.vatId ),
		};
	},

	setErrorMessages: (
		oldDetails: ManagedContactDetails,
		errors: ManagedContactDetailsErrors
	): ManagedContactDetails => {
		return setManagedContactDetailsErrors( errors, oldDetails );
	},
};

export type WpcomStoreState = {
	siteId: string;
	transactionResult: object;
	contactDetails: ManagedContactDetails;
};

export const domainManagedContactDetails: ManagedContactDetails = {
	firstName: getInitialManagedValue( { isRequired: true } ),
	lastName: getInitialManagedValue( { isRequired: true } ),
	organization: getInitialManagedValue( { isRequired: true } ),
	email: getInitialManagedValue( { isRequired: true } ),
	alternateEmail: getInitialManagedValue( { isRequired: true } ),
	phone: getInitialManagedValue( { isRequired: true } ),
	phoneNumberCountry: getInitialManagedValue( { isRequired: true } ),
	address1: getInitialManagedValue( { isRequired: true } ),
	address2: getInitialManagedValue( { isRequired: true } ),
	city: getInitialManagedValue( { isRequired: true } ),
	state: getInitialManagedValue( { isRequired: true } ),
	postalCode: getInitialManagedValue( { isRequired: true } ),
	countryCode: getInitialManagedValue( { isRequired: true } ),
	fax: getInitialManagedValue( { isRequired: true } ),
	vatId: getInitialManagedValue( { isRequired: true } ),
};

export const taxManagedContactDetails: ManagedContactDetails = {
	firstName: getInitialManagedValue(),
	lastName: getInitialManagedValue(),
	organization: getInitialManagedValue(),
	email: getInitialManagedValue(),
	alternateEmail: getInitialManagedValue(),
	phone: getInitialManagedValue(),
	phoneNumberCountry: getInitialManagedValue(),
	address1: getInitialManagedValue(),
	address2: getInitialManagedValue(),
	city: getInitialManagedValue(),
	state: getInitialManagedValue(),
	postalCode: getInitialManagedValue( { isRequired: true } ),
	countryCode: getInitialManagedValue( { isRequired: true } ),
	fax: getInitialManagedValue(),
	vatId: getInitialManagedValue(),
};

export function getInitialWpcomStoreState(
	contactDetails: ManagedContactDetails
): WpcomStoreState {
	return {
		siteId: '',
		transactionResult: {},
		contactDetails,
	};
}
