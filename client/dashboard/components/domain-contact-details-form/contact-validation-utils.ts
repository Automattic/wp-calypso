import type {
	ContactValidationResponseMessages,
	DomainContactDetails,
	DomainContactValidationResponse,
	SMSCountryCode,
} from '@automattic/api-core';
import type { NormalizedField } from '@wordpress/dataviews';

/**
 * Type for the async validation function
 */
export type AsyncValidator = (
	item: DomainContactDetails
) => Promise< DomainContactValidationResponse >;

/**
 * Maps DomainContactDetails field IDs (camelCase) to API response keys (snake_case)
 */
export const FIELD_TO_API_KEY_MAP: Record<
	keyof DomainContactDetails,
	keyof ContactValidationResponseMessages | null
> = {
	firstName: 'first_name',
	lastName: 'last_name',
	organization: 'organization',
	email: 'email',
	phone: 'phone',
	address1: 'address_1',
	address2: 'address_2',
	city: 'city',
	state: 'state',
	postalCode: 'postal_code',
	countryCode: 'country_code',
	fax: 'fax',
	vatId: 'vat_id',
	optOutTransferLock: null, // Not validated by API
	extra: null, // Has nested structure, handled separately if needed
};

/**
 * Creates an async validator for a specific field.
 * Extracts field-specific errors from the validation API response.
 * @param fieldId - The field ID to validate
 * @param asyncValidatorFn - The async validation function that validates the entire form
 * @returns An async validator function that extracts errors for the specific field
 */
export const createFieldAsyncValidator = (
	fieldId: keyof DomainContactDetails,
	asyncValidatorFn: AsyncValidator
) => {
	return async (
		item: DomainContactDetails,
		field: NormalizedField< DomainContactDetails >
	): Promise< string | null > => {
		// Get the field value
		const value = field.getValue ? field.getValue( { item } ) : '';

		// Skip validation if field is empty (required validation handles this)
		if ( ! value ) {
			return null;
		}

		// Get the API key for this field
		const apiKey = FIELD_TO_API_KEY_MAP[ fieldId ];
		if ( ! apiKey ) {
			return null;
		}

		try {
			// Call the validation function
			const result = await asyncValidatorFn( item );

			// If successful, return null (no error)
			if ( result.success ) {
				return null;
			}

			// Extract field-specific error from messages
			const fieldErrors = result.messages[ apiKey ];
			// Check if fieldErrors is a string array (not the 'extra' object type)
			if ( Array.isArray( fieldErrors ) && fieldErrors.length > 0 ) {
				return fieldErrors[ 0 ]; // Return first error message
			}

			// No specific error for this field
			return null;
		} catch ( error ) {
			// Silently fail on network errors, form will validate on submit anyway
			return null;
		}
	};
};

/**
 * Maps a validation response's per-field messages (snake_case API keys) to form
 * field IDs (camelCase), keeping the first message per field. Lets the form surface
 * errors for every affected field from a single whole-form validation response.
 * @param messages - The `messages` object from a failed validation response
 * @returns A map of field IDs to their first error message
 */
export const mapValidationMessagesToFieldErrors = (
	messages: ContactValidationResponseMessages | undefined
): Record< string, string > => {
	const fieldErrors: Record< string, string > = {};
	if ( ! messages ) {
		return fieldErrors;
	}

	for ( const [ fieldId, apiKey ] of Object.entries( FIELD_TO_API_KEY_MAP ) as [
		keyof DomainContactDetails,
		keyof ContactValidationResponseMessages | null,
	][] ) {
		if ( ! apiKey ) {
			continue;
		}
		const messagesForField = messages[ apiKey ];
		if ( Array.isArray( messagesForField ) && messagesForField.length > 0 ) {
			fieldErrors[ fieldId ] = messagesForField[ 0 ];
		}
	}

	return fieldErrors;
};

export function sanitizePhoneCountryCode( phoneCountryCode: string ): string {
	return phoneCountryCode ? '+' + phoneCountryCode.replace( /[^0-9]/g, '' ) : '';
}

export function sanitizePhoneNumber( phoneNumber: string ): string {
	return phoneNumber.replace( /[^0-9]/g, '' );
}

export function splitPhoneNumber( phoneNumber: string ): string[] {
	const firstDotIndex = phoneNumber.indexOf( '.' );
	if ( firstDotIndex === -1 ) {
		return [ '', '' ];
	}
	return [
		sanitizePhoneCountryCode( phoneNumber.substring( 0, firstDotIndex ) ),
		sanitizePhoneNumber( phoneNumber.substring( firstDotIndex + 1 ) ),
	];
}

export function combinePhoneNumber( countryNumericCode: string, phoneNumber: string ): string {
	return `${ countryNumericCode }.${ phoneNumber }`;
}

/**
 * Resolves the SMS country entry for a phone number's numeric dialing code.
 *
 * A single dialing code can be shared by several countries (for example +1 is
 * used by the US, Canada, and a number of Caribbean nations). Matching on the
 * numeric code alone returns the first entry (the Bahamas for +1), which showed
 * the wrong country for US and Canadian numbers (DOMENG-635). When the dialing
 * code is shared, prefer the entry that matches the contact's own country code.
 */
export function resolveSmsCountry(
	smsCountryCodes: SMSCountryCode[] | undefined,
	numericCode: string,
	preferredCountryCode: string
): SMSCountryCode | undefined {
	const countriesForCode =
		smsCountryCodes?.filter( ( country ) => country.numeric_code === numericCode ) ?? [];
	return (
		countriesForCode.find( ( country ) => country.code === preferredCountryCode ) ??
		countriesForCode[ 0 ]
	);
}
