/**
 * Internal dependencies
 */
import {
	DomainContactDetails,
	PossiblyCompleteDomainContactDetails,
	DomainContactDetailsErrors,
	CaDomainContactExtraDetails,
	CaDomainContactExtraDetailsErrors,
	UkDomainContactExtraDetails,
	UkDomainContactExtraDetailsErrors,
	FrDomainContactExtraDetails,
	FrDomainContactExtraDetailsErrors,
} from './backend/domain-contact-details-components';
import {
	DomainContactValidationRequest,
	DomainContactValidationRequestExtraFields,
	DomainContactValidationResponse,
} from './backend/domain-contact-validation-endpoint';

export type ManagedContactDetailsShape< T > = {
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
 * Asymmetrically combine two ManagedContactDetailsShape<T> objects 'update' and 'data'
 * using two helper functions.
 *
 *   merge: (A,B) => B merges fields which exist in both update and data
 *   construct: (A) => B constructs new fields which exist in update but not data
 *
 * Fields which exist in data but not update are copied, and fields which do not
 * exist in either data or update do not exist in the result.
 *
 * More precisely, this function should satisfy the following property for all accessors A:
 *
 *   _.get( updateManagedContactDetailsShape( merge, construct, update, data ), A )
 *     === merge( _.get( update, A ), _.get( data, A ) ) if update.A and data.A are defined;
 *     === construct( _.get( update, A ) )               if update.A is defined and data.A is undefined;
 *     === _.get( data, A )                              if data.A is defined and update.A is undefined;
 *     === undefined                                     if data.A and update.A are undefined.
 */
export function updateManagedContactDetailsShape< A, B >(
	merge: ( arg0: A, arg1: B ) => B,
	construct: ( arg0: A ) => B,
	update: ManagedContactDetailsShape< A >,
	data: ManagedContactDetailsShape< B >
): ManagedContactDetailsShape< B > {
	const tldExtraFields: ManagedContactDetailsTldExtraFieldsShape< B > = {};

	const combine = ( u, v ) => {
		if ( typeof u !== 'undefined' && typeof v !== 'undefined' ) {
			return merge( u, v );
		} else if ( typeof u !== 'undefined' && typeof v === 'undefined' ) {
			return construct( u );
		} else if ( typeof u === 'undefined' && typeof v !== 'undefined' ) {
			return v;
		}
		return undefined;
	};

	if ( data.tldExtraFields?.ca ) {
		if ( update.tldExtraFields?.ca ) {
			tldExtraFields.ca = {
				lang: combine( update.tldExtraFields.ca.lang, data.tldExtraFields.ca.lang ),
				legalType: combine( update.tldExtraFields.ca.legalType, data.tldExtraFields.ca.legalType ),
				ciraAgreementAccepted: combine(
					update.tldExtraFields.ca.ciraAgreementAccepted,
					data.tldExtraFields.ca.ciraAgreementAccepted
				),
			};
		} else {
			tldExtraFields.ca = data.tldExtraFields.ca;
		}
	} else if ( update.tldExtraFields?.ca ) {
		tldExtraFields.ca = {
			lang: construct( update.tldExtraFields.ca.lang ),
			legalType: construct( update.tldExtraFields.ca.legalType ),
			ciraAgreementAccepted: construct( update.tldExtraFields.ca.ciraAgreementAccepted ),
		};
	}

	if ( data.tldExtraFields?.uk ) {
		if ( update.tldExtraFields?.uk ) {
			tldExtraFields.uk = {
				registrantType: combine(
					update.tldExtraFields.uk.registrantType,
					data.tldExtraFields.uk.registrantType
				),
				registrationNumber: combine(
					update.tldExtraFields.uk.registrationNumber,
					data.tldExtraFields.uk.registrationNumber
				),
				tradingName: combine(
					update.tldExtraFields.uk.tradingName,
					data.tldExtraFields.uk.tradingName
				),
			};
		} else {
			tldExtraFields.uk = data.tldExtraFields.uk;
		}
	} else if ( update.tldExtraFields?.uk ) {
		tldExtraFields.uk = {
			registrantType: construct( update.tldExtraFields.uk.registrantType ),
			registrationNumber: construct( update.tldExtraFields.uk.registrationNumber ),
			tradingName: construct( update.tldExtraFields.uk.tradingName ),
		};
	}

	if ( data.tldExtraFields?.fr ) {
		if ( update.tldExtraFields?.fr ) {
			tldExtraFields.fr = {
				registrantType: combine(
					update.tldExtraFields.fr.registrantType,
					data.tldExtraFields.fr.registrantType
				),
				trademarkNumber: combine(
					update.tldExtraFields.fr.trademarkNumber,
					data.tldExtraFields.fr.trademarkNumber
				),
				sirenSirat: combine(
					update.tldExtraFields.fr.sirenSirat,
					data.tldExtraFields.fr.sirenSirat
				),
			};
		} else {
			tldExtraFields.fr = data.tldExtraFields.fr;
		}
	} else if ( update.tldExtraFields?.fr ) {
		tldExtraFields.fr = {
			registrantType: construct( update.tldExtraFields.fr.registrantType ),
			trademarkNumber: construct( update.tldExtraFields.fr.trademarkNumber ),
			sirenSirat: construct( update.tldExtraFields.fr.sirenSirat ),
		};
	}

	return {
		firstName: combine( update.firstName, data.firstName ),
		lastName: combine( update.lastName, data.lastName ),
		organization: combine( update.organization, data.organization ),
		email: combine( update.email, data.email ),
		alternateEmail: combine( update.alternateEmail, data.alternateEmail ),
		phone: combine( update.phone, data.phone ),
		phoneNumberCountry: combine( update.phoneNumberCountry, data.phoneNumberCountry ),
		address1: combine( update.address1, data.address1 ),
		address2: combine( update.address2, data.address2 ),
		city: combine( update.city, data.city ),
		state: combine( update.state, data.state ),
		postalCode: combine( update.postalCode, data.postalCode ),
		countryCode: combine( update.countryCode, data.countryCode ),
		fax: combine( update.fax, data.fax ),
		vatId: combine( update.vatId, data.vatId ),
		tldExtraFields,
	};
}

export function flattenManagedContactDetailsShape< A, B >(
	f: ( arg0: A ) => B,
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
					f( x.tldExtraFields.ca.ciraAgreementAccepted ),
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
	return ( arg.errors?.length ?? 0 ) <= 0 && ( arg.value?.length > 0 || ! arg.isRequired );
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

function touchIfDifferent( newValue: undefined | string, oldData: ManagedValue ): ManagedValue {
	if ( newValue === undefined ) {
		return oldData;
	}
	return newValue === oldData.value
		? oldData
		: { ...oldData, value: newValue, isTouched: true, errors: [] };
}

function setValueUnlessTouched(
	newValue: undefined | null | string,
	oldData: ManagedValue
): ManagedValue {
	if ( newValue === undefined || newValue === null ) {
		return oldData;
	}
	return oldData.isTouched ? oldData : { ...oldData, value: newValue, errors: [] };
}

function setErrors( errors: string[] | undefined, oldData: ManagedValue ): ManagedValue {
	return undefined === errors ? { ...oldData, errors: [] } : { ...oldData, errors };
}

function getManagedValuesList( details: ManagedContactDetails ): ManagedValue[] {
	return flattenManagedContactDetailsShape( ( x ) => x, details );
}

export function isCompleteAndValid( details: ManagedContactDetails ): boolean {
	const values = getManagedValuesList( details );
	return values.length > 0 && values.every( isValid );
}

export function isTouched( details: ManagedContactDetails ): boolean {
	const values = getManagedValuesList( details );
	return values.length > 0 && values.every( ( value ) => value.isTouched );
}

export function areRequiredFieldsNotEmpty( details: ManagedContactDetails ): boolean {
	const values = getManagedValuesList( details );
	return (
		values.length > 0 && values.every( ( value ) => value.value?.length > 0 || ! value.isRequired )
	);
}

function setManagedContactDetailsErrors(
	errors: ManagedContactDetailsErrors,
	details: ManagedContactDetails
): ManagedContactDetails {
	return updateManagedContactDetailsShape(
		( error, detail ) => setErrors( error, detail ),
		( error ) => getInitialManagedValue( { errors: error } ),
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
		extra: prepareTldExtraContactDetails( details ),
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
		extra: prepareTldExtraContactDetailsErrors( details ),
	};
}

function prepareTldExtraContactDetails(
	details: ManagedContactDetails
): {
	ca: null | CaDomainContactExtraDetails;
	uk: null | UkDomainContactExtraDetails;
	fr: null | FrDomainContactExtraDetails;
} {
	return {
		ca: prepareCaDomainContactExtraDetails( details ),
		uk: prepareUkDomainContactExtraDetails( details ),
		fr: prepareFrDomainContactExtraDetails( details ),
	};
}

function prepareTldExtraContactDetailsErrors(
	details: ManagedContactDetails
): {
	ca: null | CaDomainContactExtraDetailsErrors;
	uk: null | UkDomainContactExtraDetailsErrors;
	fr: null | FrDomainContactExtraDetailsErrors;
} {
	return {
		ca: prepareCaDomainContactExtraDetailsErrors( details ),
		uk: prepareUkDomainContactExtraDetailsErrors( details ),
		fr: prepareFrDomainContactExtraDetailsErrors( details ),
	};
}

function prepareCaDomainContactExtraDetails(
	details: ManagedContactDetails
): CaDomainContactExtraDetails | null {
	if ( details.tldExtraFields?.ca ) {
		return {
			lang: details.tldExtraFields.ca.lang.value,
			legalType: details.tldExtraFields.ca.legalType.value,
			ciraAgreementAccepted: details.tldExtraFields.ca.ciraAgreementAccepted.value === 'true',
		};
	}
	return null;
}

function prepareCaDomainContactExtraDetailsErrors(
	details: ManagedContactDetails
): CaDomainContactExtraDetailsErrors | null {
	if ( details.tldExtraFields?.ca ) {
		return {
			lang: details.tldExtraFields.ca.lang.errors[ 0 ],
			legalType: details.tldExtraFields.ca.legalType.errors[ 0 ],
			ciraAgreementAccepted: details.tldExtraFields.ca.ciraAgreementAccepted.errors[ 0 ],
		};
	}
	return null;
}

function prepareUkDomainContactExtraDetails(
	details: ManagedContactDetails
): UkDomainContactExtraDetails | null {
	if ( details.tldExtraFields?.uk ) {
		return {
			registrantType: details.tldExtraFields.uk.registrantType.value,
			registrationNumber: details.tldExtraFields.uk.registrationNumber.value,
			tradingName: details.tldExtraFields.uk.tradingName.value,
		};
	}
	return null;
}

function prepareUkDomainContactExtraDetailsErrors(
	details: ManagedContactDetails
): UkDomainContactExtraDetailsErrors | null {
	if ( details.tldExtraFields?.uk ) {
		// Needed for compatibility with existing component props
		const toErrorPayload = ( errorMessage, index ) => {
			return { errorCode: index.toString(), errorMessage };
		};

		return {
			registrantType: details.tldExtraFields.uk.registrantType.errors.map( toErrorPayload ),
			registrationNumber: details.tldExtraFields.uk.registrationNumber.errors.map( toErrorPayload ),
			tradingName: details.tldExtraFields.uk.tradingName.errors.map( toErrorPayload ),
		};
	}
	return null;
}

function prepareFrDomainContactExtraDetails(
	details: ManagedContactDetails
): FrDomainContactExtraDetails | null {
	if ( details.tldExtraFields?.fr ) {
		return {
			registrantType: details.tldExtraFields.fr.registrantType.value,
			registrantVatId: details.vatId.value,
			trademarkNumber: details.tldExtraFields.fr.trademarkNumber.value,
			sirenSirat: details.tldExtraFields.fr.sirenSirat.value,
		};
	}
	return null;
}

function prepareFrDomainContactExtraDetailsErrors(
	details: ManagedContactDetails
): FrDomainContactExtraDetailsErrors | null {
	if ( details.tldExtraFields?.fr ) {
		return {
			registrantType: details.tldExtraFields.fr.registrantType.errors[ 0 ],
			registrantVatId: details.vatId.errors[ 0 ],
			trademarkNumber: details.tldExtraFields.fr.trademarkNumber.errors[ 0 ],
			sirenSirat: details.tldExtraFields.fr.sirenSirat.errors[ 0 ],
		};
	}
	return null;
}

export function prepareDomainContactValidationRequest(
	domainNames: string[],
	details: ManagedContactDetails
): DomainContactValidationRequest {
	const extra: DomainContactValidationRequestExtraFields = {};

	if ( details.tldExtraFields?.ca ) {
		extra.ca = {
			lang: details.tldExtraFields.ca.lang.value,
			legal_type: details.tldExtraFields.ca.legalType.value,
			cira_agreement_accepted: details.tldExtraFields.ca.ciraAgreementAccepted.value === 'true',
		};
	}
	if ( details.tldExtraFields?.uk ) {
		extra.uk = {
			registrant_type: details.tldExtraFields.uk.registrantType.value,
			registration_number: details.tldExtraFields.uk.registrationNumber.value,
			trading_name: details.tldExtraFields.uk.tradingName.value,
		};
	}
	if ( details.tldExtraFields?.fr ) {
		extra.fr = {
			registrant_type: details.tldExtraFields.fr.registrantType.value,
			trademark_number: details.tldExtraFields.fr.trademarkNumber.value,
			siren_sirat: details.tldExtraFields.fr.sirenSirat.value,
		};
	}

	return {
		domain_names: domainNames,
		contact_information: {
			firstName: details.firstName.value,
			lastName: details.lastName.value,
			organization: details.organization.value,
			email: details.email.value,
			alternateEmail: details.alternateEmail.value,
			phone: details.phone.value,
			phoneNumberCountry: details.phoneNumberCountry.value,
			address1: details.address1.value,
			address2: details.address2.value,
			city: details.city.value,
			state: details.state.value,
			postalCode: details.postalCode.value,
			countryCode: details.countryCode.value,
			fax: details.fax.value,
			vatId: details.vatId.value,
			extra,
		},
	};
}

export function formatDomainContactValidationResponse(
	response: DomainContactValidationResponse
): ManagedContactDetailsErrors {
	return {
		firstName: response.messages?.firstName,
		lastName: response.messages?.lastName,
		organization: response.messages?.organization,
		email: response.messages?.email,
		alternateEmail: response.messages?.alternateEmail,
		phone: response.messages?.phone,
		phoneNumberCountry: response.messages?.phoneNumberCountry,
		address1: response.messages?.address1,
		address2: response.messages?.address2,
		city: response.messages?.city,
		state: response.messages?.state,
		postalCode: response.messages?.postalCode,
		countryCode: response.messages?.countryCode,
		fax: response.messages?.fax,
		vatId: response.messages?.vatId,
		tldExtraFields: {
			ca: {
				lang: response.messages?.extra?.ca?.lang,
				legalType: response.messages?.extra?.ca?.legalType,
				ciraAgreementAccepted: response.messages?.extra?.ca?.ciraAgreementAccepted,
			},
			uk: {
				registrantType: response.messages?.extra?.uk?.registrantType,
				registrationNumber: response.messages?.extra?.uk?.registrationNumber,
				tradingName: response.messages?.extra?.uk?.tradingName,
			},
			fr: {
				registrantType: response.messages?.extra?.fr?.registrantType,
				trademarkNumber: response.messages?.extra?.fr?.trademarkNumber,
				sirenSirat: response.messages?.extra?.fr?.sirenSirat,
			},
		},
	};
}

function prepareManagedContactDetailsUpdate(
	rawFields: DomainContactDetails
): ManagedContactDetailsUpdate {
	return {
		firstName: rawFields.firstName,
		lastName: rawFields.lastName,
		organization: rawFields.organization,
		email: rawFields.email,
		alternateEmail: rawFields.alternateEmail,
		phone: rawFields.phone,
		phoneNumberCountry: undefined,
		address1: rawFields.address1,
		address2: rawFields.address2,
		city: rawFields.city,
		state: rawFields.state,
		postalCode: rawFields.postalCode,
		countryCode: rawFields.countryCode,
		fax: rawFields.fax,
		vatId: rawFields.vatId,
		tldExtraFields: {
			ca: {
				lang: rawFields?.extra?.ca?.lang,
				legalType: rawFields?.extra?.ca?.legalType,
				ciraAgreementAccepted: rawFields?.extra?.ca?.ciraAgreementAccepted?.toString(),
			},
			uk: {
				registrantType: rawFields?.extra?.uk?.registrantType,
				registrationNumber: rawFields?.extra?.uk?.registrationNumber,
				tradingName: rawFields?.extra?.uk?.tradingName,
			},
			fr: {
				registrantType: rawFields?.extra?.fr?.registrantType,
				trademarkNumber: rawFields?.extra?.fr?.trademarkNumber,
				sirenSirat: rawFields?.extra?.fr?.sirenSirat,
			},
		},
	};
}

function applyDomainContactDetailsUpdate(
	oldDetails: ManagedContactDetails,
	update: ManagedContactDetailsUpdate
): ManagedContactDetails {
	return updateManagedContactDetailsShape(
		( newField: undefined | string, detail: ManagedValue ) => {
			return touchIfDifferent( newField, detail );
		},
		( newField: undefined | string ) => getInitialManagedValue( { value: newField } ),
		update,
		oldDetails
	);
}

/*
 * Helper type which bundles the field updaters in a single object
 * to help keep import lists under control. All updaters should
 * assume input came from the user.
 */
export type ManagedContactDetailsUpdaters = {
	updatePhone: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updatePhoneNumberCountry: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updatePostalCode: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updateCountryCode: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	updateDomainContactFields: (
		arg0: ManagedContactDetails,
		arg1: DomainContactDetails
	) => ManagedContactDetails;
	touchContactFields: ( arg0: ManagedContactDetails ) => ManagedContactDetails;
	updateVatId: ( arg0: ManagedContactDetails, arg1: string ) => ManagedContactDetails;
	setErrorMessages: (
		arg0: ManagedContactDetails,
		arg1: ManagedContactDetailsErrors
	) => ManagedContactDetails;
	populateDomainFieldsFromCache: (
		arg0: ManagedContactDetails,
		arg1: PossiblyCompleteDomainContactDetails
	) => ManagedContactDetails;
};

export const managedContactDetailsUpdaters: ManagedContactDetailsUpdaters = {
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

	updateDomainContactFields: (
		oldDetails: ManagedContactDetails,
		newField: DomainContactDetails
	): ManagedContactDetails => {
		return applyDomainContactDetailsUpdate(
			oldDetails,
			prepareManagedContactDetailsUpdate( newField )
		);
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
	return updateManagedContactDetailsShape(
		( isRequired, managedValue ) => {
			return { ...managedValue, isRequired };
		},
		( isRequired ) => getInitialManagedValue( { isRequired } ),
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
