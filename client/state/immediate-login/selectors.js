/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { REASONS_FOR_MANUAL_RENEWAL } from './constants';

/**
 * Retrieves information about whether an immediate login attempt was made for
 * the current instance of Calypso.
 *
 * @param  {object} state - Global state tree
 * @returns {bool} - Whether the client request indicates that an immediate
 *                  login attempt was made
 */
export const wasImmediateLoginAttempted = ( state ) => {
	return get( state, 'immediateLogin.attempt', false );
};

/**
 * Retrieves information about whether an immediate login attempt was
 * successful (according to query parameters provided in the client request)
 * during the current instance of Calypso.
 *
 * This and the other selectors in this file are based on information provided
 * in the URL (which can be tampered with) so it should not be used to trust
 * that the immediate login actually occurred. However, it is appropriate to
 * use it to make user interface improvements for the immediate login scenario.
 *
 * @param {object} state - Global state tree
 * @returns {bool} - Whether the client request indicates that an immediate
 *                  login attempt was successful
 */
export const wasImmediateLoginSuccessfulAccordingToClient = ( state ) => {
	return get( state, 'immediateLogin.success', false );
};

/**
 * Retrieves the reason information provided in the query parameters of
 * immediate login request.
 *
 * @param  {object} state - Global state tree
 * @returns {?string} - Reason for immediate login, or null
 */
export const getImmediateLoginReason = ( state ) => {
	return get( state, 'immediateLogin.reason', null );
};

/**
 * Retrieves the email address used for the immediate login attempt, according
 * to query parameters provided in the client request.
 *
 * @param  {object} state - Global state tree
 * @returns {?string} - Email address used for the immediate login attempt, or
 *                     null
 */
export const getImmediateLoginEmail = ( state ) => {
	return get( state, 'immediateLogin.email', null );
};

/**
 * Retrieves the language code for the immediate login attempt, according
 * to query parameters provided in the client request.
 *
 * @param  {object} state - Global state tree
 * @returns {?string} - Two-letter code for the preferred language of the user
 *                     attempting to log in, or null
 */
export const getImmediateLoginLocale = ( state ) => {
	return get( state, 'immediateLogin.locale', null );
};

/**
 * Retrieves information about whether an immediate login attempt was made from
 * a link in an email that requested the user to manually renew a subscription
 * (according to query parameters provided in the client request) for the
 * current instance of Calypso.
 *
 * @param {object} state - Global state tree
 * @returns {bool} - Whether the client request indicates that an immediate
 *                  login attempt was made from a manual renewal email
 */
export const wasManualRenewalImmediateLoginAttempted = ( state ) => {
	return includes( REASONS_FOR_MANUAL_RENEWAL, getImmediateLoginReason( state ) );
};
