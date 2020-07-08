/**
 * External dependencies
 */
import React from 'react';
import { get, omit } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';

export function getSMSMessageFromResponse( response ) {
	const phoneNumber = get( response, 'body.data.phone_number' );

	return translate( 'Message sent to phone number ending in %(phoneNumber)s', {
		args: {
			phoneNumber,
		},
	} );
}

const errorFields = {
	empty_password: 'password',
	empty_two_step_code: 'twoStepCode',
	empty_username: 'usernameOrEmail',
	incorrect_password: 'password',
	invalid_email: 'usernameOrEmail',
	invalid_two_step_code: 'twoStepCode',
	invalid_username: 'usernameOrEmail',
};

export class HTTPError extends Error {
	constructor( response, body ) {
		super();
		this.name = 'HTTPError';
		this.status = response.status;
		try {
			this.response = { body: JSON.parse( body ) };
		} catch {
			this.response = { body };
		}
	}
}

/**
 * Retrieves the first error message from the specified HTTP error.
 *
 * @param {object} httpError HTTP error
 * @returns {{code: string?, message: string, field: string}} an error message and the id of the corresponding field, if not global
 */
export function getErrorFromHTTPError( httpError ) {
	let field = 'global';

	if ( ! httpError.status ) {
		return {
			code: 'network_error',
			message: httpError.message,
			field,
		};
	}

	const code = get( httpError, 'response.body.data.errors[0].code' );

	if ( code ) {
		if ( code in errorFields ) {
			field = errorFields[ code ];
		} else if ( code === 'compromisable_account' ) {
			const url = localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' );
			return {
				code,
				message: (
					<p>
						{ translate(
							'Your account has been blocked as a security precaution. To continue, you must {{a}}reset your password{{/a}}.',
							{ components: { a: <a href={ url } rel="external" /> } }
						) }
					</p>
				),
				field,
			};
		} else if ( code === 'admin_login_attempt' ) {
			const url = localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword' );

			return {
				code,
				message: (
					<div>
						<p>
							{ translate(
								'You attempted to login with the username {{em}}admin{{/em}} on WordPress.com.',
								{ components: { em: <em /> } }
							) }
						</p>

						<p>
							{ translate(
								'If you were trying to access your self hosted {{a}}WordPress.org{{/a}} site, ' +
									'try {{strong}}yourdomain.com/wp-admin/{{/strong}} instead.',
								{
									components: {
										a: <a href="http://wordpress.org" target="_blank" rel="noopener noreferrer" />,
										strong: <strong />,
									},
								}
							) }
						</p>

						<p>
							{ translate(
								'If you can’t remember your WordPress.com username, you can {{a}}reset your password{{/a}} ' +
									'by providing your email address.',
								{
									components: {
										a: <a href={ url } rel="external" />,
									},
								}
							) }
						</p>
					</div>
				),
				field,
			};
		}
	}

	let message = get( httpError, 'response.body.data.errors[0].message' );

	if ( ! message ) {
		message = get( httpError, 'response.body.data', httpError.message );
	}

	return { code, message, field };
}

/**
 * Transforms WPCOM error to the error object we use for login purposes
 *
 * @param {object} wpcomError HTTP error
 * @returns {{message: string, field: string, code: string}} an error message and the id of the corresponding field
 */
export const getErrorFromWPCOMError = ( wpcomError ) => ( {
	message: wpcomError.message,
	code: wpcomError.error,
	field: 'global',
	...omit( wpcomError, [ 'error', 'message', 'field' ] ),
} );

/**
 * Determines whether the user account uses regular authentication by password.
 *
 * @param {string} authAccountType - authentication account type
 * @returns {boolean} true if the account is regular, false otherwise
 */
export const isRegularAccount = ( authAccountType ) => authAccountType === 'regular';

/**
 * Determines whether the user account uses authentication without password.
 *
 * @param {string} authAccountType - authentication account type
 * @returns {boolean} true if the account is passwordless, false otherwise
 */
export const isPasswordlessAccount = ( authAccountType ) => authAccountType === 'passwordless';

export function stringifyBody( bodyObj ) {
	// Clone bodyObj, replacing null or undefined values with empty strings.
	const body = Object.fromEntries(
		Object.entries( bodyObj ?? {} ).map( ( [ key, val ] ) => [ key, val ?? '' ] )
	);
	return new globalThis.URLSearchParams( body ).toString();
}

export async function postLoginRequest( action, bodyObj ) {
	const response = await window.fetch(
		localizeUrl( `https://wordpress.com/wp-login.php?action=${ action }` ),
		{
			method: 'POST',
			credentials: 'include',
			headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
			body: stringifyBody( bodyObj ),
		}
	);

	if ( response.ok ) {
		return { body: await response.json() };
	}
	throw new HTTPError( response, await response.text() );
}
