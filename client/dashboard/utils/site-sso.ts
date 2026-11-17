import { addQueryArgs } from '@wordpress/url';

/**
 * Route a URL on an Atomic site through Jetpack SSO so the customer arrives
 * logged in to the site.
 *
 * They have a WordPress.com session, not a session on their Atomic site, and
 * those are different things. Without one, wp-admin shows a login form for a
 * site they just made, and a Coming Soon front end shows them the Coming Soon
 * page. Jetpack SSO trades the session they have for the one they need and
 * forwards them on.
 * @param url Absolute URL on the site to land on: wp-admin or the front end.
 * @returns The SSO URL, or the original when it cannot be parsed.
 */
export function withJetpackSso( url: string ): string {
	let target: URL;
	try {
		target = new URL( url );
	} catch {
		// Not something we can rewrite. Hand back what we were given rather than
		// dropping the customer's redirect entirely.
		return url;
	}

	// SSO lives on the site's own host. A *.wordpress.com address is the
	// WordPress.com side of an Atomic site rather than the site itself, and
	// logging in there does not produce a session on the site.
	if ( target.hostname.endsWith( '.wordpress.com' ) ) {
		target.hostname = target.hostname.replace( '.wordpress.com', '.wpcomstaging.com' );
	}

	const login = new URL( target.href );
	login.pathname = '/wp-login.php';
	login.search = '';

	// Deliberately NOT `action=jetpack-sso`. Jetpack only saves the
	// `jetpack_sso_redirect_to` cookie — the sole carrier of the destination
	// across the WordPress.com round trip — on the plain login path; a direct
	// `action=jetpack-sso` entry skips save_cookies() and the return leg falls
	// back to admin_url(), landing the customer on /wp-admin with the deep link
	// gone. A plain wp-login.php?redirect_to=… saves the cookie, and wpcomsh
	// auto-forwards Calypso-referred visitors to WordPress.com SSO anyway.
	return addQueryArgs( login.href, {
		// Relative, so the redirect cannot be pointed off-site.
		redirect_to: `${ target.pathname }${ target.search }`,
	} );
}
