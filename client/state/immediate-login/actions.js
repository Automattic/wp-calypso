/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { IMMEDIATE_LOGIN_SAVE_INFO } from 'calypso/state/action-types';

/**
 * Stores immediate link-related information in state so it can be reused later
 *
 * @param {bool} success - Whether the immediate login attempt was successful.
 * @param {string} reason - Reason for this immediate login, if known.
 * @param {string} email - Email address used for the immediate login attempt,
 *                         if known.
 * @param {string} locale - Two-letter code for the preferred language of the
 *                          user attempting to log in, if known.
 * @returns {void}
 */
export const saveImmediateLoginInformation = ( success, reason, email, locale ) => ( {
	type: IMMEDIATE_LOGIN_SAVE_INFO,
	success,
	reason,
	email,
	locale,
} );
