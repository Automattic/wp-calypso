import { tryToGuessPostalCodeFormat } from '@automattic/wpcom-checkout';
import type {
	DomainContactDetails,
	CaDomainContactExtraDetails,
	UkDomainContactExtraDetails,
	FrDomainContactExtraDetails,
} from '@automattic/shopping-cart';
import type {
	PossiblyCompleteDomainContactDetails,
	DomainContactDetailsErrors,
	CaDomainContactExtraDetailsErrors,
	UkDomainContactExtraDetailsErrors,
	FrDomainContactExtraDetailsErrors,
	ManagedContactDetailsShape,
	ManagedContactDetailsTldExtraFieldsShape,
	ManagedValue,
	ManagedContactDetails,
	ManagedContactDetailsErrors,
	ManagedContactDetailsUpdate,
	ManagedContactDetailsUpdaters,
	WpcomStoreState,
	SignupValidationResponse,
	DomainContactValidationRequest,
	GSuiteContactValidationRequest,
	DomainContactValidationRequestExtraFields,
	DomainContactValidationResponse,
} from '@automattic/wpcom-checkout';
import type { TranslateResult } from 'i18n-calypso';

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
	construct: ( arg0: A | undefined ) => B | undefined,
	update: ManagedContactDetailsShape< A >,
	data: ManagedContactDetailsShape< B >
): ManagedContactDetailsShape< B > {
	const tldExtraFields: ManagedContactDetailsTldExtraFieldsShape< B > = {};

	const combine = ( u: A | undefined, v: B | undefined ): B | undefined => {
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
				sirenSiret: combine(
					update.tldExtraFields.fr.sirenSiret,
					data.tldExtraFields.fr.sirenSiret
				),
			};
		} else {
			tldExtraFields.fr = data.tldExtraFields.fr;
		}
	} else if ( update.tldExtraFields?.fr ) {
		tldExtraFields.fr = {
			registrantType: construct( update.tldExtraFields.fr.registrantType ),
			trademarkNumber: construct( update.tldExtraFields.fr.trademarkNumber ),
			sirenSiret: construct( update.tldExtraFields.fr.sirenSiret ),
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

/*
 * Map a function over the (not undefined) fields of a ManagedContactDetailsShape.
 * Satisfies the following property for all accessors A:
 *
 *  _.get( mapManagedContactDetailsShape( f, data ), A )
 *     === f( _.get( data, A ) ) if data.A is defined;
 *     === undefined             if data.A is undefined.
 */
export function mapManagedContactDetailsShape< A >(
	f: ( arg0: A ) => A,
	x: ManagedContactDetailsShape< A >
): ManagedContactDetailsShape< A > {
	return updateManagedContactDetailsShape(
		( u: A, unused: A ) => f( u ), // eslint-disable-line @typescript-eslint/no-unused-vars
		( unused ) => unused,
		x,
		x
	);
}

export function flattenManagedContactDetailsShape< A, B >(
	f: ( arg0: A ) => B,
	x: ManagedContactDetailsShape< A >
): Array< B > {
	const values = [
		x.firstName ? f( x.firstName ) : null,
		x.lastName ? f( x.lastName ) : null,
		x.organization ? f( x.organization ) : null,
		x.email ? f( x.email ) : null,
		x.alternateEmail ? f( x.alternateEmail ) : null,
		x.phone ? f( x.phone ) : null,
		x.phoneNumberCountry ? f( x.phoneNumberCountry ) : null,
		x.address1 ? f( x.address1 ) : null,
		x.address2 ? f( x.address2 ) : null,
		x.city ? f( x.city ) : null,
		x.state ? f( x.state ) : null,
		x.postalCode ? f( x.postalCode ) : null,
		x.countryCode ? f( x.countryCode ) : null,
		x.fax ? f( x.fax ) : null,
		x.vatId ? f( x.vatId ) : null,
	].filter( Boolean ) as B[];

	const caValues =
		x.tldExtraFields && x.tldExtraFields.ca
			? ( [
					x.tldExtraFields.ca.lang ? f( x.tldExtraFields.ca.lang ) : null,
					x.tldExtraFields.ca.legalType ? f( x.tldExtraFields.ca.legalType ) : null,
					x.tldExtraFields.ca.ciraAgreementAccepted
						? f( x.tldExtraFields.ca.ciraAgreementAccepted )
						: null,
			  ].filter( Boolean ) as B[] )
			: [];

	const ukValues =
		x.tldExtraFields && x.tldExtraFields.uk
			? ( [
					x.tldExtraFields.uk.registrantType ? f( x.tldExtraFields.uk.registrantType ) : null,
					x.tldExtraFields.uk.registrationNumber
						? f( x.tldExtraFields.uk.registrationNumber )
						: null,
					x.tldExtraFields.uk.tradingName ? f( x.tldExtraFields.uk.tradingName ) : null,
			  ].filter( Boolean ) as B[] )
			: [];

	const frValues =
		x.tldExtraFields && x.tldExtraFields.fr
			? ( [
					x.tldExtraFields.fr.registrantType ? f( x.tldExtraFields.fr.registrantType ) : null,
					x.tldExtraFields.fr.trademarkNumber ? f( x.tldExtraFields.fr.trademarkNumber ) : null,
					x.tldExtraFields.fr.sirenSiret ? f( x.tldExtraFields.fr.sirenSiret ) : null,
			  ].filter( Boolean ) as B[] )
			: [];

	return values.concat( caValues, ukValues, frValues );
}

export function isValid( arg: ManagedValue ): boolean {
	return ( arg.errors?.length ?? 0 ) <= 0;
}

function getInitialManagedValue( initialProperties?: {
	value?: string;
	isTouched?: boolean;
	errors?: Array< string | TranslateResult >;
} ): ManagedValue {
	return {
		value: '',
		isTouched: false,
		errors: [],
		...initialProperties,
	};
}

function touchField( oldData: ManagedValue ): ManagedValue {
	return { ...oldData, isTouched: true };
}

function clearFieldErrors( oldData: ManagedValue ): ManagedValue {
	return { ...oldData, errors: [] };
}

function touchIfDifferent(
	newValue: undefined | string,
	oldData: ManagedValue | undefined
): ManagedValue {
	if ( newValue === undefined && oldData !== undefined ) {
		return oldData;
	}
	if ( oldData !== undefined && newValue === oldData.value ) {
		return oldData;
	}
	return { ...oldData, value: newValue ?? '', isTouched: true, errors: [] };
}

function setValueUnlessTouched(
	newValue: undefined | null | string,
	oldData: ManagedValue | undefined
): ManagedValue | undefined {
	if ( newValue === undefined || newValue === null || oldData === undefined ) {
		return oldData;
	}
	return oldData.isTouched ? oldData : { ...oldData, value: newValue, errors: [] };
}

function setErrors(
	errors: string[] | TranslateResult[] | undefined,
	oldData: ManagedValue
): ManagedValue {
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
		firstName: details.firstName?.value,
		lastName: details.lastName?.value,
		organization: details.organization?.value,
		email: details.email?.value,
		alternateEmail: details.alternateEmail?.value,
		phone: details.phone?.value,
		address1: details.address1?.value,
		address2: details.address2?.value,
		city: details.city?.value,
		state: details.state?.value,
		postalCode: details.postalCode?.value,
		countryCode: details.countryCode?.value,
		fax: details.fax?.value,
		extra: prepareTldExtraContactDetails( details ),
	};
}

export function prepareDomainContactDetailsForTransaction(
	details: ManagedContactDetails
): DomainContactDetails {
	return {
		firstName: details.firstName?.value,
		lastName: details.lastName?.value,
		organization: details.organization?.value,
		email: details.email?.value,
		alternateEmail: details.alternateEmail?.value,
		phone: details.phone?.value,
		address1: details.address1?.value,
		address2: details.address2?.value,
		city: details.city?.value,
		state: details.state?.value,
		postalCode: tryToGuessPostalCodeFormat(
			details.postalCode?.value ?? '',
			details.countryCode?.value
		),
		countryCode: details.countryCode?.value,
		fax: details.fax?.value,
		extra: prepareTldExtraContactDetails( details ),
	};
}

export function prepareDomainContactDetailsErrors(
	details: ManagedContactDetails
): DomainContactDetailsErrors {
	return {
		firstName: details.firstName?.errors[ 0 ],
		lastName: details.lastName?.errors[ 0 ],
		organization: details.organization?.errors[ 0 ],
		email: details.email?.errors[ 0 ],
		alternateEmail: details.alternateEmail?.errors[ 0 ],
		phone: details.phone?.errors[ 0 ],
		address1: details.address1?.errors[ 0 ],
		address2: details.address2?.errors[ 0 ],
		city: details.city?.errors[ 0 ],
		state: details.state?.errors[ 0 ],
		postalCode: details.postalCode?.errors[ 0 ],
		countryCode: details.countryCode?.errors[ 0 ],
		fax: details.fax?.errors[ 0 ],
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
			lang: details.tldExtraFields.ca.lang?.value,
			legalType: details.tldExtraFields.ca.legalType?.value,
			ciraAgreementAccepted: details.tldExtraFields.ca.ciraAgreementAccepted?.value === 'true',
		};
	}
	return null;
}

function prepareCaDomainContactExtraDetailsErrors(
	details: ManagedContactDetails
): CaDomainContactExtraDetailsErrors | null {
	if ( details.tldExtraFields?.ca ) {
		return {
			lang: details.tldExtraFields.ca?.lang?.errors?.[ 0 ],
			legalType: details.tldExtraFields.ca?.legalType?.errors?.[ 0 ],
			ciraAgreementAccepted: details.tldExtraFields.ca?.ciraAgreementAccepted?.errors?.[ 0 ],
		};
	}
	return null;
}

function prepareUkDomainContactExtraDetails(
	details: ManagedContactDetails
): UkDomainContactExtraDetails | null {
	if ( details.tldExtraFields?.uk ) {
		return {
			registrantType: details.tldExtraFields.uk.registrantType?.value,
			registrationNumber: details.tldExtraFields.uk.registrationNumber?.value,
			tradingName: details.tldExtraFields.uk.tradingName?.value,
		};
	}
	return null;
}

function prepareUkDomainContactExtraDetailsErrors(
	details: ManagedContactDetails
): UkDomainContactExtraDetailsErrors | null {
	if ( details.tldExtraFields?.uk ) {
		// Needed for compatibility with existing component props
		const toErrorPayload = ( errorMessage: string | TranslateResult, index: number ) => {
			return { errorCode: index.toString(), errorMessage };
		};

		return {
			registrantType: details.tldExtraFields.uk?.registrantType?.errors?.map( toErrorPayload ),
			registrationNumber: details.tldExtraFields.uk?.registrationNumber?.errors?.map(
				toErrorPayload
			),
			tradingName: details.tldExtraFields.uk?.tradingName?.errors?.map( toErrorPayload ),
		};
	}
	return null;
}

function prepareFrDomainContactExtraDetails(
	details: ManagedContactDetails
): FrDomainContactExtraDetails | null {
	if ( details.tldExtraFields?.fr ) {
		return {
			registrantType: details.tldExtraFields.fr.registrantType?.value,
			registrantVatId: details.vatId?.value,
			trademarkNumber: details.tldExtraFields.fr.trademarkNumber?.value,
			sirenSiret: details.tldExtraFields.fr.sirenSiret?.value,
		};
	}
	return null;
}

function prepareFrDomainContactExtraDetailsErrors(
	details: ManagedContactDetails
): FrDomainContactExtraDetailsErrors | null {
	if ( details.tldExtraFields?.fr ) {
		return {
			registrantType: details.tldExtraFields.fr?.registrantType?.errors,
			registrantVatId: details.vatId?.errors,
			trademarkNumber: details.tldExtraFields.fr?.trademarkNumber?.errors,
			sirenSiret: details.tldExtraFields.fr?.sirenSiret?.errors,
		};
	}
	return null;
}

export function prepareDomainContactValidationRequest(
	details: ManagedContactDetails
): DomainContactValidationRequest {
	const extra: DomainContactValidationRequestExtraFields = {};

	if ( details.tldExtraFields?.ca ) {
		extra.ca = {
			lang: details.tldExtraFields.ca.lang?.value,
			legal_type: details.tldExtraFields.ca.legalType?.value,
			cira_agreement_accepted: details.tldExtraFields.ca.ciraAgreementAccepted?.value === 'true',
		};
	}
	if ( details.tldExtraFields?.uk ) {
		extra.uk = {
			registrant_type: details.tldExtraFields.uk.registrantType?.value,
			registration_number: details.tldExtraFields.uk.registrationNumber?.value,
			trading_name: details.tldExtraFields.uk.tradingName?.value,
		};
	}
	if ( details.tldExtraFields?.fr ) {
		extra.fr = {
			registrant_type: details.tldExtraFields.fr.registrantType?.value,
			registrant_vat_id: details.vatId?.value,
			trademark_number: details.tldExtraFields.fr.trademarkNumber?.value,
			siren_siret: details.tldExtraFields.fr.sirenSiret?.value,
		};
	}

	return {
		contact_information: {
			first_name: details.firstName?.value,
			last_name: details.lastName?.value,
			organization: details.organization?.value,
			email: details.email?.value,
			alternate_email: details.alternateEmail?.value,
			phone: details.phone?.value,
			phone_number_country: details.phoneNumberCountry?.value,
			address_1: details.address1?.value,
			address_2: details.address2?.value,
			city: details.city?.value,
			state: details.state?.value,
			postal_code: tryToGuessPostalCodeFormat(
				details.postalCode?.value ?? '',
				details.countryCode?.value
			),
			country_code: details.countryCode?.value,
			fax: details.fax?.value,
			vat_id: details.vatId?.value,
			extra,
		},
	};
}

export function prepareGSuiteContactValidationRequest(
	details: ManagedContactDetails
): GSuiteContactValidationRequest {
	return {
		contact_information: {
			first_name: details.firstName?.value ?? '',
			last_name: details.lastName?.value ?? '',
			alternate_email: details.alternateEmail?.value ?? '',
			postal_code: tryToGuessPostalCodeFormat(
				details.postalCode?.value ?? '',
				details.countryCode?.value
			),
			country_code: details.countryCode?.value ?? '',
		},
	};
}

export function getSignupValidationErrorResponse(
	response: SignupValidationResponse,
	email: string,
	emailTakenLoginRedirect: ( email: string ) => TranslateResult
): ManagedContactDetailsErrors {
	const emailResponse: Record< string, string > = response.messages?.email ?? {};

	if ( Object.keys( emailResponse ).length === 0 ) {
		return emailResponse;
	}

	const emailErrorMessageFromResponse = Object.values( emailResponse )[ 0 ] || '';
	const errorMessage = emailResponse.hasOwnProperty( 'taken' )
		? emailTakenLoginRedirect( email )
		: emailErrorMessageFromResponse;

	return {
		email: [ errorMessage ],
	};
}

export function formatDomainContactValidationResponse(
	response: DomainContactValidationResponse
): ManagedContactDetailsErrors {
	return {
		firstName: response.messages?.first_name,
		lastName: response.messages?.last_name,
		organization: response.messages?.organization,
		email: response.messages?.email,
		alternateEmail: response.messages?.alternate_email,
		phone: response.messages?.phone,
		phoneNumberCountry: response.messages?.phone_number_country,
		address1: response.messages?.address_1,
		address2: response.messages?.address_2,
		city: response.messages?.city,
		state: response.messages?.state,
		postalCode: response.messages?.postal_code,
		countryCode: response.messages?.country_code,
		fax: response.messages?.fax,
		vatId: response.messages?.vat_id,
		tldExtraFields: {
			ca: {
				lang: response.messages?.extra?.ca?.lang,
				legalType: response.messages?.extra?.ca?.legal_type,
				ciraAgreementAccepted: response.messages?.extra?.ca?.cira_agreement_accepted,
			},
			uk: {
				registrantType: response.messages?.extra?.uk?.registrant_type,
				registrationNumber: response.messages?.extra?.uk?.registration_number,
				tradingName: response.messages?.extra?.uk?.trading_name,
			},
			fr: {
				registrantType: response.messages?.extra?.fr?.registrant_type,
				trademarkNumber: response.messages?.extra?.fr?.trademark_number,
				sirenSiret: response.messages?.extra?.fr?.siren_siret,
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
				sirenSiret: rawFields?.extra?.fr?.sirenSiret,
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

	updateEmail: ( oldDetails: ManagedContactDetails, newEmail: string ): ManagedContactDetails => {
		return {
			...oldDetails,
			email: touchIfDifferent( newEmail, oldDetails.email ),
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
		return mapManagedContactDetailsShape( touchField, oldDetails );
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

	clearErrorMessages: ( oldDetails: ManagedContactDetails ): ManagedContactDetails => {
		return mapManagedContactDetailsShape( clearFieldErrors, oldDetails );
	},

	populateCountryCodeFromGeoIP: (
		oldDetails: ManagedContactDetails,
		newCountryCode: string
	): ManagedContactDetails => {
		return {
			...oldDetails,
			countryCode: setValueUnlessTouched( newCountryCode, oldDetails.countryCode ),
		};
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

export function getInitialWpcomStoreState(
	contactDetails: ManagedContactDetails
): WpcomStoreState {
	return {
		siteId: '',
		siteSlug: '',
		recaptchaClientId: -1,
		transactionResult: undefined,
		contactDetails,
	};
}
