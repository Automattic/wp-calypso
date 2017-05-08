/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import config, { isEnabled } from 'config';

export function login( { legacy, redirectTo } = {} ) {
	const legacyUrl = config( 'login_url' );
	const url = ! legacy && isEnabled( 'wp-login' ) ? '/login' : legacyUrl;

	return redirectTo
		? addQueryArgs( { redirect_to: redirectTo }, url )
		: url;
}
