import { getTld } from '@automattic/domain-search';
import tlds from 'tlds';
import { validate as baseEmailValidate } from '../../../node_modules/email-validator/index.js';

export interface EmailValidationResult {
	isValid: boolean;
	error?: 'empty' | 'invalid_format' | 'invalid_tld';
}

const VALID_TLDS = new Set( tlds );

/**
 * Validates an email address.
 *
 * Checks both RFC compliance and TLD validity against the official IANA TLD list.
 * This prevents acceptance of emails like "user@gmail.comExtraText" (see GitHub issue #106738).
 *
 * @param email - The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function isValidEmail( email: string ): boolean {
	return validateEmail( email ).isValid;
}

/**
 * Validates an email address with detailed error information.
 *
 * Performs comprehensive validation:
 * - RFC format compliance via email-validator package
 * - TLD validation against official IANA list (1,438 TLDs)
 * - Supports multi-level TLDs (e.g., co.uk, com.au)
 *
 * @param email - The email address to validate
 * @returns Validation result with isValid flag and optional error type
 */
export function validateEmail( email: string ): EmailValidationResult {
	if ( ! email || email.trim() === '' ) {
		return { isValid: false, error: 'empty' };
	}

	const trimmedEmail = email.trim();

	if ( ! baseEmailValidate( trimmedEmail ) ) {
		return { isValid: false, error: 'invalid_format' };
	}

	const atIndex = trimmedEmail.lastIndexOf( '@' );
	if ( atIndex === -1 ) {
		return { isValid: false, error: 'invalid_format' };
	}

	const domain = trimmedEmail.substring( atIndex + 1 );
	if ( ! domain ) {
		return { isValid: false, error: 'invalid_format' };
	}

	if ( ! /^[a-z0-9.-]+$/i.test( domain ) ) {
		return { isValid: false, error: 'invalid_format' };
	}

	const tld = getTld( domain );
	if ( ! tld ) {
		return { isValid: false, error: 'invalid_tld' };
	}

	const tldLower = tld.toLowerCase();

	const tldToCheck = tldLower.includes( '.' )
		? tldLower.substring( tldLower.lastIndexOf( '.' ) + 1 )
		: tldLower;

	if ( ! VALID_TLDS.has( tldToCheck ) ) {
		return { isValid: false, error: 'invalid_tld' };
	}

	return { isValid: true };
}

export const validate = isValidEmail;

export default {
	validate: isValidEmail,
};
