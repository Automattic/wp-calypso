/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Processes a redux ROUTE_SET action and returns a URL that contains no parameters that
 * are related to immediate login.
 *
 * @param {string} path  - path
 * @param {object} query - query parameters
 * @returns {string}      - the URL without related params
 */
export const createPathWithoutImmediateLoginInformation = ( path, query ) => {
	const relatedParamNames = [
		'immediate_login_attempt',
		'immediate_login_success',
		'login_reason',
		'login_email',
		'login_locale',
	];
	const newQuery = Object.keys( query )
		.filter( ( k ) => relatedParamNames.indexOf( k ) === -1 )
		.map( ( k ) => `${ encodeURIComponent( k ) }=${ encodeURIComponent( query[ k ] ) }` );
	return path + ( newQuery.length ? '?' + newQuery.join( '&' ) : '' );
};

/**
 * Creates a human-understandable message that communicates that current user was logged in
 *
 * @param {string}  loginReason  - Reason why user were logged in, the message may vary depending on it.
 * @param {string}  email        - Email of currently logged in user
 * @returns {string}              - Message to show to user
 */
export const createImmediateLoginMessage = ( loginReason, email ) => {
	// It's possible to vary the message based on login reason, but currently
	// the default message is used in all cases. (Since the user reached this
	// page via one click from an email, the expectation is that it's the
	// responsibility of the email and the page to make clear to the user why
	// they're actually here, not this message.)
	return translate( "You're logged in as %(email)s.", { args: { email } } );
};
