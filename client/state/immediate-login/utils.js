/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { REASONS_FOR_MANUAL_RENEWAL } from './constants';

/**
 * Processes a redux ROUTE_SET action and returns a URL that contains no parameters that
 * are related to immediate login.
 *
 * @param {string} path  - path
 * @param {object} query - query parameters
 * @return {string}      - the URL without related params
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
		.filter( k => relatedParamNames.indexOf( k ) === -1 )
		.map( k => `${ encodeURIComponent( k ) }=${ encodeURIComponent( query[ k ] ) }` );
	return path + ( newQuery.length ? '?' + newQuery.join( '&' ) : '' );
};

/**
 * Creates a human-understandable message that communicates that current user was logged in
 *
 * @param {string}  loginReason  - Reason why user were logged in, the message may vary depending on it.
 * @param {string}  email        - Email of currently logged in user
 * @return {string}              - Message to show to user
 */
export const createImmediateLoginMessage = ( loginReason, email ) => {
	if ( includes( REASONS_FOR_MANUAL_RENEWAL, loginReason ) ) {
		return translate(
			'We logged you in as %(email)s so you can update your payment details and renew your subscription.',
			{
				args: { email },
			}
		);
	}

	// Default message.
	return translate( 'We logged you in as %(email)s.', { args: { email } } );
};
