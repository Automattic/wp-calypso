import config from '@automattic/calypso-config';
import { getCalypsoUrl } from '@automattic/calypso-url';

/**
 * In wp-admin (Odyssey) a root-relative href is a Calypso route, which the browser would
 * resolve against the site's own domain — a 404. Point it at Calypso absolutely there;
 * getCalypsoUrl() falls back to https://wordpress.com when the current origin isn't a
 * Calypso one, as in wp-admin. Everywhere else (Calypso proper, Jetpack Cloud) this is a
 * no-op, so it is safe to apply to any href of unknown origin.
 * @param href The href to absolutize.
 * @returns The href, absolutized against Calypso only when it is a root-relative route in wp-admin.
 */
export default function toCalypsoHref< T >( href: T ): T | string {
	if (
		typeof href === 'string' &&
		href.startsWith( '/' ) &&
		! href.startsWith( '//' ) &&
		config.isEnabled( 'is_odyssey' )
	) {
		return getCalypsoUrl( href );
	}
	return href;
}
