/**
 * Studio's web surfaces that checkout may hand a buyer back to: the landing site and the web
 * app. Every allowlist that guards a post-checkout, cancel or back destination spreads this
 * list in, so a Studio host is trusted by all of them or by none.
 */
export const STUDIO_WEB_HOSTS: readonly string[] = [ 'wordpress.studio', 'app.wordpress.studio' ];

export const STUDIO_WEB_ORIGINS: readonly string[] = STUDIO_WEB_HOSTS.map(
	( host ) => `https://${ host }`
);

/**
 * Where the Studio checkout's back and close buttons go when the URL has no `checkoutBackUrl`,
 * `cancel_to` or Studio round trip of its own.
 */
export const STUDIO_DEFAULT_BACK_URL = 'https://wordpress.studio/';

export const STUDIO_WEB_APP_URL = 'https://app.wordpress.studio/';

// The trailing slash keeps `/checkout/studio-return` out.
const STUDIO_CHECKOUT_PATH_PREFIX = '/checkout/studio/';

export function isStudioCheckoutPath( pathname: string ): boolean {
	return pathname.startsWith( STUDIO_CHECKOUT_PATH_PREFIX );
}
