import { debounce } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import wpcom from 'calypso/lib/wp';

const ALLOWED_USERNAME_CHARACTERS_REGEX = /^[a-z0-9]+$/;
const USERNAME_MIN_LENGTH = 4;

export interface ValidationResult {
	success?: boolean;
	error?: string;
	message?: string;
	allowed_actions?: Record< string, string >;
	validatedUsername?: string;
}

async function validateUsername(
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

		const { success, allowed_actions } = await wpcom.req.get(
			`/me/username/validate/${ username }`
		);

		setValidationResult( { success, allowed_actions, validatedUsername: username } );
	} catch ( error: any ) {
		setValidationResult( error );
	}
}

export const validateUsernameDebounced = debounce(
	validateUsername as ( ...args: unknown[] ) => unknown,
	600
) as typeof validateUsername;

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

export async function submitUsernameChange( username: string, action: string ) {
	return wpcom.req.post( '/me/username', { username, action } );
}
