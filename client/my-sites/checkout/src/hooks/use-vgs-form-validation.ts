/**
 * Hook to access VGS form state and validation
 * Used to check form validity before submission and trigger error display
 */

import { useVGSCollectFormInstance } from '@vgs/collect-js-react';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { VGS } from '@vgs/collect-js';

/**
 * Check if VGS form has validation errors
 * @param formData - VGS form state data
 * @returns true if form has validation errors, false otherwise
 */
export function hasVgsFormValidationErrors( formData: VGS.FormData ): boolean {
	if ( ! formData ) {
		return false;
	}

	// Check if any field is invalid
	return Object.values( formData ).some( ( field ) => ! field.isValid );
}

/**
 * Get the first validation error message from VGS form
 * @param formData - VGS form state data
 * @returns Error message string or null if no errors
 */
export function getVgsFormValidationError( formData: VGS.FormData ): string | null {
	if ( ! formData ) {
		return null;
	}

	// Find the first invalid field
	const invalidField = Object.values( formData ).find( ( field ) => ! field.isValid );

	if ( ! invalidField ) {
		return null;
	}

	// Get the first error message
	const error = invalidField.errors?.[ 0 ];
	if ( ! error ) {
		return null;
	}

	// Map VGS error codes to user-friendly messages
	const errorCode = error.code || 0;

	// Field name mapping from VGS field names to our field names
	const fieldName = invalidField.name;

	if ( fieldName === 'card_number' || fieldName === 'card-number' ) {
		switch ( errorCode ) {
			case 1001:
				return __( 'Card number is required.', 'calypso' );
			case 1011:
				return __( 'Card number is invalid.', 'calypso' );
		}
	} else if ( fieldName === 'card_exp' || fieldName === 'card-expiration-date' ) {
		switch ( errorCode ) {
			case 1001:
				return __( 'Expiration date is required.', 'calypso' );
			case 1015:
				return __( 'Expiration date is invalid.', 'calypso' );
		}
	} else if ( fieldName === 'card_cvc' || fieldName === 'card-security-code' ) {
		switch ( errorCode ) {
			case 1001:
				return __( 'Security code is required.', 'calypso' );
			case 1017:
				return __( 'Security code is invalid.', 'calypso' );
		}
	}

	// Default error message
	return error.message || __( 'Please check your card details.', 'calypso' );
}

/**
 * Hook to validate VGS form before submission
 * @returns Function to validate VGS form and return validation result
 */
export function useVgsFormValidation() {
	const [ form ] = useVGSCollectFormInstance();

	const validateVgsForm = useCallback( (): {
		isValid: boolean;
		errorMessage: string | null;
	} => {
		if ( ! form ) {
			return {
				isValid: false,
				errorMessage: __(
					'Payment form is not ready. Please wait for the form to load.',
					'calypso'
				),
			};
		}

		const formData = form.state;
		if ( ! formData ) {
			return {
				isValid: false,
				errorMessage: __( 'Please enter your card details.', 'calypso' ),
			};
		}

		const hasErrors = hasVgsFormValidationErrors( formData );
		const errorMessage = hasErrors ? getVgsFormValidationError( formData ) : null;

		return {
			isValid: ! hasErrors,
			errorMessage,
		};
	}, [ form ] );

	return { validateVgsForm, form };
}
