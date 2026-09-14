/**
 * Normalize user input into a bare Mastodon instance host.
 *
 * The backend `/reader/mastodon/connections` endpoint expects an `instance`
 * value shaped like `mastodon.social`, not a URL or a handle. We accept a
 * range of natural inputs and reduce them to that shape:
 *
 * - `mastodon.social`              → `mastodon.social`
 * - `https://mastodon.social`      → `mastodon.social`
 * - `https://mastodon.social/`     → `mastodon.social`
 * - `https://mastodon.social/@me`  → `mastodon.social`
 * - `@user@mastodon.social`        → `mastodon.social`
 * - `user@mastodon.social`         → `mastodon.social`
 * - `Mastodon.Social`              → `mastodon.social`
 * - `mastodon.social:8443`         → `mastodon.social:8443`
 * - `mastodon.social.`             → `mastodon.social` (trailing dot)
 *
 * If the input can't be parsed into a host, return the trimmed original so
 * the backend's `invalid_instance` error surfaces normally rather than
 * sending an empty body.
 */
export function normalizeInstance( input: string ): string {
	const trimmed = input.trim();
	if ( ! trimmed ) {
		return '';
	}

	// Strip a leading Mastodon-style handle prefix (`@user@`) so what remains
	// is something `URL` can parse. The inner `@` in userinfo can confuse
	// URL parsers across engines; pre-stripping is the safer path.
	const withoutHandle = trimmed.replace( /^@[^@/\s]+@/, '' );

	const explicitScheme = withoutHandle.match( /^([a-z][a-z0-9+.-]*):\/\//i );
	if ( explicitScheme && ! /^https?$/i.test( explicitScheme[ 1 ] ) ) {
		return trimmed;
	}

	if ( ! explicitScheme ) {
		const bareHandle = withoutHandle.match( /^[^@:/\s]+@(.+)$/ );
		if ( bareHandle ) {
			return hostFromInput( bareHandle[ 1 ] ) ?? trimmed;
		}
	}

	try {
		const url = new URL( explicitScheme ? withoutHandle : `https://${ withoutHandle }` );
		if ( url.username || url.password ) {
			return trimmed;
		}

		const remoteProfile = url.pathname.match( /^\/@[^@/\s]+@([^/?#]+)/ );
		if ( remoteProfile ) {
			return hostFromInput( remoteProfile[ 1 ] ) ?? trimmed;
		}

		return formatUrlHost( url );
	} catch {
		return trimmed;
	}
}

function hostFromInput( input: string ): string | null {
	try {
		const url = new URL( `https://${ input }` );
		if ( url.username || url.password ) {
			return null;
		}
		return formatUrlHost( url );
	} catch {
		return null;
	}
}

function formatUrlHost( url: URL ): string {
	// `URL.hostname` is already lowercased per the WHATWG URL spec.
	const hostname = url.hostname.endsWith( '.' ) ? url.hostname.slice( 0, -1 ) : url.hostname;
	return url.port ? `${ hostname }:${ url.port }` : hostname;
}
