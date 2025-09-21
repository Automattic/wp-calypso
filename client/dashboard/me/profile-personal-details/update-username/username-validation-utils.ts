import { __ } from '@wordpress/i18n';
import wpcom from 'calypso/lib/wp';

const ALLOWED_USERNAME_CHARACTERS_REGEX = /^[a-z0-9]+$/;
const USERNAME_MIN_LENGTH = 4;

// Simple debounce function to replace lodash
function debounceFunction< T extends ( ...args: any[] ) => any >(
	func: T,
	delay: number
): ( ...args: Parameters< T > ) => void {
	let timeoutId: NodeJS.Timeout;
	return ( ...args: Parameters< T > ) => {
		clearTimeout( timeoutId );
		timeoutId = setTimeout( () => func( ...args ), delay );
	};
}

export interface ValidationResult {
	success?: boolean;
	error?: string;
	message?: string;
	allowed_actions?: Record< string, string >;
	validatedUsername?: string;
}

export function createUsernameValidator(
	currentUsername: string,
	setValidationResult: ( result: ValidationResult | null ) => void
) {
	return debounceFunction( async ( username: string ) => {
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

		try {
			const { success, allowed_actions } = await wpcom.req.get(
				`/me/username/validate/${ username }`
			);

			setValidationResult( { success, allowed_actions, validatedUsername: username } );
		} catch ( error: any ) {
			setValidationResult( error );
		}
	}, 600 );
}

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
