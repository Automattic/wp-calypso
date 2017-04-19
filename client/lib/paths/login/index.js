/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import config, { isEnabled } from 'config';

export function login( { redirectTo } ) {
	const url = isEnabled( 'wp-login' ) ? '/login' : config( 'login_url' );

	return redirectTo
		? addQueryArgs( { redirect_to: redirectTo }, url )
		: url;
}
