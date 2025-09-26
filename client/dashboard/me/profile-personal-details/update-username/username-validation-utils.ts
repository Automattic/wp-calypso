import { validateUsername } from '@automattic/api-core';
import { debounce } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import type { UsernameValidationResult } from '@automattic/api-core';

const ALLOWED_USERNAME_CHARACTERS_REGEX = /^[a-z0-9]+$/;
const USERNAME_MIN_LENGTH = 4;

export type ValidationResult = UsernameValidationResult;

async function validateUsernameInternal(
	username: string,
	currentUsername: string,
	setValidationResult: ( result: ValidationResult | null ) => void
) {
	try {
		if ( username === currentUsername ) {
			setValidationResult( null );
			return;
		}

		if ( username.length < USERNAME_MIN_LENGTH ) {
			setValidationResult( {
				error: 'invalid_input',
				message: __( 'Usernames must be at least 4 characters.' ),
			} );
			return;
		}

		if ( ! ALLOWED_USERNAME_CHARACTERS_REGEX.test( username ) ) {
			setValidationResult( {
				error: 'invalid_input',
				message: __( 'Usernames can only contain lowercase letters (a-z) and numbers.' ),
			} );
			return;
		}

		const result = await validateUsername( username );

		setValidationResult( { ...result, validatedUsername: username } );
	} catch ( error: unknown ) {
		setValidationResult( error as ValidationResult );
	}
}

export const validateUsernameDebounced = debounce(
	validateUsernameInternal as ( ...args: unknown[] ) => unknown,
	600
) as typeof validateUsernameInternal;

export function isUsernameValid( validationResult: ValidationResult | null ): boolean {
	return !! (
		validationResult &&
		'success' in validationResult &&
		validationResult.success === true
	);
}

export function getUsernameValidationMessage(
	validationResult: ValidationResult | null
): string | null {
	if ( ! validationResult ) {
		return null;
	}
	return validationResult.message ?? null;
}

export function getAllowedActions(
	validationResult: ValidationResult | null
): Record< string, string > {
	if ( ! validationResult ) {
		return {};
	}
	return validationResult.allowed_actions ?? {};
}
