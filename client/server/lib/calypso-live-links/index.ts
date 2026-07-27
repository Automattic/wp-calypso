import config from '@automattic/calypso-config';
import isDashboardEnv from 'calypso/dashboard/utils/is-dashboard-env';

/**
 * Cross-app link targets for calypso.live preview containers.
 *
 * A calypso.live PR preview runs each app flavour (classic Calypso, Multi-site
 * Dashboard) in its own container under a random `container-*.calypso.live`
 * hostname, so the static app URLs in config would send cross-app links to
 * production/staging — off the previewed build entirely.
 *
 * A container cannot derive its sibling's hostname, but it doesn't have to:
 * the calypso.live redirector resolves an image ref to a running container and
 * carries the path and remaining query params across the 302, so
 * `https://calypso.live/domains/add/foo.blog?image=<ref>&env=dashboard` lands
 * on `https://container-x.calypso.live/domains/add/foo.blog`. One ref covers
 * both flavours: they run the same image, and `env` picks the flavour.
 *
 * The ref has to be the build-numbered tag TeamCity bakes in as
 * `CALYPSO_LIVE_IMAGE` — the same one the calypso.live PR comment links to.
 * Deriving it from `COMMIT_SHA` does not work: calypso.live resolves a ref by
 * pulling it anonymously, and the `commit-<sha>` tags TeamCity also pushes are
 * not pullable that way, so every such link 404s with "Image ... not found".
 *
 * The server only hands the ref to the client; the link builders in
 * `client/dashboard/utils/calypso-live.ts` decide what to do with it. Nothing
 * is resolved server side: no fetch, no polling, no per-render race with a cold
 * sibling.
 */

const IMAGE_REF_PATTERN = /^registry\.a8c\.com\/calypso\/app:build-\d+$/;

// The A4A Dashboard shares the dotcom Dashboard's env id, and is told apart
// only by the `-a4a` suffix calypso.live gives its container.
const A4A_HOSTNAME_SUFFIX = '-a4a.calypso.live';

function isCalypsoLiveDotcomHostname( hostname: string | undefined ): boolean {
	return !! hostname?.endsWith( '.calypso.live' ) && ! hostname.endsWith( A4A_HOSTNAME_SUFFIX );
}

function getImageRef(): string | null {
	const imageRef = process.env.CALYPSO_LIVE_IMAGE;
	return imageRef && IMAGE_REF_PATTERN.test( imageRef ) ? imageRef : null;
}

/**
 * Returns clientData config additions for a calypso.live preview request, or
 * null when the request isn't one (production, staging and local dev are
 * unaffected).
 */
export function getCalypsoLiveClientConfig(
	hostname: string | undefined
): Record< string, string > | null {
	const imageRef = getImageRef();
	if ( ! isCalypsoLiveDotcomHostname( hostname ) || ! imageRef ) {
		return null;
	}

	// Flavours without a dotcom sibling (e.g. Jetpack Cloud) keep static values.
	if ( config( 'env_id' ) !== 'wpcalypso' && ! isDashboardEnv() ) {
		return null;
	}

	return { calypso_live_image: imageRef };
}
