import config from '@automattic/calypso-config';
import isDashboardEnv from 'calypso/dashboard/utils/is-dashboard-env';

/**
 * Cross-app link targets for calypso.live preview containers.
 *
 * A calypso.live PR preview runs each app flavour (classic Calypso, Multi-site
 * Dashboard) in its own container under a random `container-*.calypso.live`
 * hostname, so the static `wpcom_url`/`dashboard_url` config values would send
 * cross-app links to production/staging — off the previewed build entirely.
 *
 * A container cannot derive its sibling's hostname, but it doesn't have to:
 * the calypso.live redirector resolves an image ref to a running container and
 * carries the path and remaining query params across the 302, so
 * `https://calypso.live/domains/add/foo.blog?image=<ref>&env=dashboard` lands
 * on `https://container-x.calypso.live/domains/add/foo.blog`. The image ref for
 * the container's own build is `registry.a8c.com/calypso/app:commit-<sha>`,
 * from the `COMMIT_SHA` baked into the image.
 *
 * So both app URLs point at the redirector rather than at a resolved origin.
 * Nothing is resolved server side: no fetch, no polling, no per-render race
 * with a cold sibling. The cost is an extra hop per cross-app navigation, and
 * the same for the app's links to itself — a container's own flavour resolves
 * back to itself, since container identity is keyed on the image ref. Keeping
 * both keys on the redirector is what makes `back_to`/cancel targets round
 * trip: the two containers agree on the `https://calypso.live` origin, which
 * `dashboardOrigins()` allowlists, whereas neither can predict the other's
 * container hostname.
 */

const IMAGE_REPOSITORY = 'registry.a8c.com/calypso/app';
const REDIRECTOR_ORIGIN = 'https://calypso.live';

// Dashboard variants (CIAB, A4A) share dashboard env ids but run on suffixed
// calypso.live hostnames; only the dotcom flavours participate.
const EXCLUDED_HOSTNAME_SUFFIXES = [
	'-ciab.calypso.live',
	'-a4a.calypso.live',
	'-jetpack.calypso.live',
];

function isCalypsoLiveDotcomHostname( hostname: string | undefined ): boolean {
	if ( ! hostname?.endsWith( '.calypso.live' ) ) {
		return false;
	}
	return ! EXCLUDED_HOSTNAME_SUFFIXES.some( ( suffix ) => hostname.endsWith( suffix ) );
}

function getCommitPinnedImageRef(): string | null {
	const sha = process.env.COMMIT_SHA;
	if ( ! sha || ! /^[0-9a-f]{40}$/.test( sha ) ) {
		return null;
	}
	return `${ IMAGE_REPOSITORY }:commit-${ sha }`;
}

function buildRedirectorUrl( imageRef: string, env?: string ): string {
	const url = new URL( REDIRECTOR_ORIGIN );
	url.searchParams.set( 'image', imageRef );
	if ( env ) {
		url.searchParams.set( 'env', env );
	}
	return url.href;
}

/**
 * Returns clientData config overrides for a calypso.live preview request, or
 * null when the request isn't one (production, staging and local dev are
 * unaffected).
 */
export function getCalypsoLiveUrlOverrides(
	hostname: string | undefined
): Record< string, string > | null {
	const imageRef = getCommitPinnedImageRef();
	if ( ! isCalypsoLiveDotcomHostname( hostname ) || ! imageRef ) {
		return null;
	}

	// Flavours without a dotcom sibling (e.g. Jetpack Cloud) keep static values.
	if ( config( 'env_id' ) !== 'wpcalypso' && ! isDashboardEnv() ) {
		return null;
	}

	return {
		wpcom_url: buildRedirectorUrl( imageRef ),
		dashboard_url: buildRedirectorUrl( imageRef, 'dashboard' ),
	};
}
