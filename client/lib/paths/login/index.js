/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import config, { isEnabled } from 'config';

export function login( { legacy, redirectTo, twoFactorAuthType } = {} ) {
	const legacyUrl = config( 'login_url' );

	let url = '';

	if ( ! legacy && isEnabled( 'wp-login' ) ) {
		url = '/log-in';

		if ( twoFactorAuthType ) {
			url += '/' + twoFactorAuthType;
		}
	} else {
		url = legacyUrl;
	}

	return redirectTo
		? addQueryArgs( { redirect_to: redirectTo }, url )
		: url;
}
