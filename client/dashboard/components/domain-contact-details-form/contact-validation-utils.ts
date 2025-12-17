import type {
	ContactValidationResponseMessages,
	DomainContactDetails,
	DomainContactValidationResponse,
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
