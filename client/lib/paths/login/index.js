/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import config, { isEnabled } from 'config';

export function login( { isNative, redirectTo, twoFactorAuthType } = {} ) {
	let url = config( 'login_url' );

	if ( isNative && isEnabled( 'login/wp-login' ) ) {
		url = '/log-in';

		if ( twoFactorAuthType ) {
			url += '/' + twoFactorAuthType;
		}
	}

	return redirectTo
		? addQueryArgs( { redirect_to: redirectTo }, url )
		: url;
}
