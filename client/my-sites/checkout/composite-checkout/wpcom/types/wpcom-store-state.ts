/**
 * Internal dependencies
 */
import {
	DomainContactDetails,
	PossiblyCompleteDomainContactDetails,
	DomainContactDetailsErrors,
} from './backend/domain-contact-details-components';

type ManagedContactDetailsShape< T > = {
	firstName: T;
	lastName: T;
	organization: T;
	email: T;
	alternateEmail: T;
	phone: T;
	phoneNumberCountry: T;
	address1: T;
	address2: T;
	city: T;
	state: T;
	postalCode: T;
	countryCode: T;
	fax: T;
	vatId: T;
	tldExtraFields: ManagedContactDetailsTldExtraFieldsShape< T >;
};

type ManagedContactDetailsTldExtraFieldsShape< T > = {
	ca?: {
		lang: T;
		legalType: T;
		ciraAgreementAccepted: T;
	};
	uk?: {
		registrantType: T;
		registrationNumber: T;
		tradingName: T;
	};
	fr?: {
		registrantType: T;
		trademarkNumber: T;
		sirenSirat: T;
	};
};

/*
 * Combine two ManagedContactDetailsShape<T> objects x and y using two
 * helper functions.
 *
 *   f: (A,B) => B merges fields which exist in both,
 *   g: (A) => B constructs new fields which don't exist in y, but do in x.
 */
function combineManagedContactDetailsShape< A, B >(
	f: ( A, B ) => B,
	g: ( A ) => B,
	x: ManagedContactDetailsShape< A >,
	y: ManagedContactDetailsShape< B >
): ManagedContactDetailsShape< B > {
	const tldExtraFields: ManagedContactDetailsTldExtraFieldsShape< B > = {};

	if ( y.tldExtraFields?.ca ) {
		if ( x.tldExtraFields?.ca ) {
			tldExtraFields.ca = {
				lang: f( x.tldExtraFields.ca.lang, y.tldExtraFields.ca.lang ),
				legalType: f( x.tldExtraFields.ca.legalType, y.tldExtraFields.ca.legalType ),
				ciraAgreementAccepted: f(
					x.tldExtraFields.ca.ciraAgreementAccepted,
					y.tldExtraFields.ca.ciraAgreementAccepted
				),
			};
		} else {
			tldExtraFields.ca = y.tldExtraFields.ca;
		}
	} else if ( x.tldExtraFields?.ca ) {
		tldExtraFields.ca = {
			lang: g( x.tldExtraFields.ca.lang ),
			legalType: g( x.tldExtraFields.ca.legalType ),
			ciraAgreementAccepted: g( x.tldExtraFields.ca.ciraAgreementAccepted ),
		};
	}

	if ( y.tldExtraFields?.uk ) {
		if ( x.tldExtraFields?.uk ) {
			tldExtraFields.uk = {
				registrantType: f( x.tldExtraFields.uk.registrantType, y.tldExtraFields.uk.registrantType ),
				registrationNumber: f(
					x.tldExtraFields.uk.registrationNumber,
					y.tldExtraFields.uk.registrationNumber
				),
				tradingName: f( x.tldExtraFields.uk.tradingName, y.tldExtraFields.uk.tradingName ),
			};
		} else {
			tldExtraFields.uk = y.tldExtraFields.uk;
		}
	} else if ( x.tldExtraFields?.uk ) {
		tldExtraFields.uk = {
			registrantType: g( x.tldExtraFields.uk.registrantType ),
			registrationNumber: g( x.tldExtraFields.uk.registrationNumber ),
			tradingName: g( x.tldExtraFields.uk.tradingName ),
		};
	}

	if ( y.tldExtraFields?.fr ) {
		if ( x.tldExtraFields?.fr ) {
			tldExtraFields.fr = {
				registrantType: f( x.tldExtraFields.fr.registrantType, y.tldExtraFields.fr.registrantType ),
				trademarkNumber: f(
					x.tldExtraFields.fr.trademarkNumber,
					y.tldExtraFields.fr.trademarkNumber
				),
				sirenSirat: f( x.tldExtraFields.fr.sirenSirat, y.tldExtraFields.fr.sirenSirat ),
			};
		} else {
			tldExtraFields.fr = y.tldExtraFields.fr;
		}
	} else if ( x.tldExtraFields?.fr ) {
		tldExtraFields.fr = {
			registrantType: g( x.tldExtraFields.fr.registrantType ),
			trademarkNumber: g( x.tldExtraFields.fr.trademarkNumber ),
			sirenSirat: g( x.tldExtraFields.fr.sirenSirat ),
		};
	}

	return {
		firstName: f( x.firstName, y.firstName ),
		lastName: f( x.lastName, y.lastName ),
		organization: f( x.organization, y.organization ),
		email: f( x.email, y.email ),
		alternateEmail: f( x.alternateEmail, y.alternateEmail ),
		phone: f( x.phone, y.phone ),
		phoneNumberCountry: f( x.phoneNumberCountry, y.phoneNumberCountry ),
		address1: f( x.address1, y.address1 ),
		address2: f( x.address2, y.address2 ),
		city: f( x.city, y.city ),
		state: f( x.state, y.state ),
		postalCode: f( x.postalCode, y.postalCode ),
		countryCode: f( x.countryCode, y.countryCode ),
		fax: f( x.fax, y.fax ),
		vatId: f( x.vatId, y.vatId ),
		tldExtraFields,
	};
}

function flattenManagedContactDetailsShape< A, B >(
	f: ( A ) => B,
	x: ManagedContactDetailsShape< A >
): Array< B > {
	const values = [
		f( x.firstName ),
		f( x.lastName ),
		f( x.organization ),
		f( x.email ),
		f( x.alternateEmail ),
		f( x.phone ),
		f( x.phoneNumberCountry ),
		f( x.address1 ),
		f( x.address2 ),
		f( x.city ),
		f( x.state ),
		f( x.postalCode ),
		f( x.countryCode ),
		f( x.fax ),
		f( x.vatId ),
	];

	const caValues =
		x.tldExtraFields && x.tldExtraFields.ca
			? [
					f( x.tldExtraFields.ca.lang ),
					f( x.tldExtraFields.ca.legalType ),
					f( x.tldExtraFields.ca.lang ),
			  ]
			: [];

	const ukValues =
		x.tldExtraFields && x.tldExtraFields.uk
			? [
					f( x.tldExtraFields.uk.registrantType ),
					f( x.tldExtraFields.uk.registrationNumber ),
					f( x.tldExtraFields.uk.tradingName ),
			  ]
			: [];

	const frValues =
		x.tldExtraFields && x.tldExtraFields.fr
			? [
					f( x.tldExtraFields.fr.registrantType ),
					f( x.tldExtraFields.fr.trademarkNumber ),
					f( x.tldExtraFields.fr.sirenSirat ),
			  ]
			: [];

	return values.concat( caValues, ukValues, frValues );
}

/*
 * The wpcom store hook stores an object with all the contact info
 * which is used to share state across fields where appropriate.
 * Each value keeps track of whether it has been edited and validated.
 */
export type ManagedContactDetails = ManagedContactDetailsShape< ManagedValue >;

export type ManagedContactDetailsErrors = ManagedContactDetailsShape< undefined | string[] >;

/*
 * Intermediate type used to represent update payloads
 */
type ManagedContactDetailsUpdate = ManagedContactDetailsShape< undefined | string >;

/*
 * Different subsets of the details are mandatory depending on what is
 * in the cart. This type lets us define these subsets declaratively.
 */
type ManagedContactDetailsRequiredMask = ManagedContactDetailsShape< boolean >;

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

function setValueUnlessTouched( newValue: string | null, oldData: ManagedValue ): ManagedValue {
	return oldData.isTouched ? oldData : { ...oldData, value: newValue || '', errors: [] };
}

function setErrors( errors: string[] | undefined, oldData: ManagedValue ): ManagedValue {
	return undefined === errors ? { ...oldData, errors: [] } : { ...oldData, errors };
}

function getManagedValuesList( details: ManagedContactDetails ): ManagedValue[] {
	return flattenManagedContactDetailsShape( x => x, details );
}

export function isCompleteAndValid( details: ManagedContactDetails ): boolean {
	const values = getManagedValuesList( details );
	return values.length > 0 && values.every( isValid );
}

export function isTouched( details: ManagedContactDetails ): boolean {
	const values = getManagedValuesList( details );
	return values.length > 0 && values.every( value => value.isTouched );
}

export function areRequiredFieldsNotEmpty( details: ManagedContactDetails ): boolean {
	const values = getManagedValuesList( details );
	return (
		values.length > 0 && values.every( value => value.value?.length > 0 || ! value.isRequired )
	);
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
	return combineManagedContactDetailsShape(
		( error, detail ) => setErrors( error, detail ),
		error => getInitialManagedValue( { errors: error } ),
		errors,
		details
	);
}

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
	populateDomainFieldsFromCache: (
		ManagedContactDetails,
		PossiblyCompleteDomainContactDetails
	) => ManagedContactDetails;
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

	populateDomainFieldsFromCache: (
		oldDetails: ManagedContactDetails,
		newDetails: PossiblyCompleteDomainContactDetails
	): ManagedContactDetails => {
		return {
			...oldDetails,
			firstName: setValueUnlessTouched( newDetails.firstName, oldDetails.firstName ),
			lastName: setValueUnlessTouched( newDetails.lastName, oldDetails.lastName ),
			organization: setValueUnlessTouched( newDetails.organization, oldDetails.organization ),
			email: setValueUnlessTouched( newDetails.email, oldDetails.email ),
			alternateEmail: setValueUnlessTouched( newDetails.alternateEmail, oldDetails.alternateEmail ),
			phone: setValueUnlessTouched( newDetails.phone, oldDetails.phone ),
			address1: setValueUnlessTouched( newDetails.address1, oldDetails.address1 ),
			address2: setValueUnlessTouched( newDetails.address2, oldDetails.address2 ),
			city: setValueUnlessTouched( newDetails.city, oldDetails.city ),
			state: setValueUnlessTouched( newDetails.state, oldDetails.state ),
			postalCode: setValueUnlessTouched( newDetails.postalCode, oldDetails.postalCode ),
			countryCode: setValueUnlessTouched( newDetails.countryCode, oldDetails.countryCode ),
			fax: setValueUnlessTouched( newDetails.fax, oldDetails.fax ),
		};
	},
};

export type WpcomStoreState = {
	siteId: string;
	transactionResult: object;
	contactDetails: ManagedContactDetails;
};

export const emptyManagedContactDetails: ManagedContactDetails = {
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
	postalCode: getInitialManagedValue(),
	countryCode: getInitialManagedValue(),
	fax: getInitialManagedValue(),
	vatId: getInitialManagedValue(),
	tldExtraFields: {},
};

export function applyContactDetailsRequiredMask(
	details: ManagedContactDetails,
	requiredMask: ManagedContactDetailsRequiredMask
): ManagedContactDetails {
	return combineManagedContactDetailsShape(
		( isRequired, managedValue ) => {
			return { ...managedValue, isRequired };
		},
		isRequired => getInitialManagedValue( { isRequired } ),
		requiredMask,
		details
	);
}

export const domainRequiredContactDetails: ManagedContactDetailsRequiredMask = {
	firstName: true,
	lastName: true,
	organization: false,
	email: true,
	alternateEmail: false,
	phone: true,
	phoneNumberCountry: false,
	address1: true,
	address2: false,
	city: true,
	state: true,
	postalCode: true,
	countryCode: true,
	fax: false,
	vatId: false,
	tldExtraFields: {},
};

export const taxRequiredContactDetails: ManagedContactDetailsRequiredMask = {
	firstName: false,
	lastName: false,
	organization: false,
	email: false,
	alternateEmail: false,
	phone: false,
	phoneNumberCountry: false,
	address1: false,
	address2: false,
	city: false,
	state: false,
	postalCode: true,
	countryCode: true,
	fax: false,
	vatId: false,
	tldExtraFields: {},
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
