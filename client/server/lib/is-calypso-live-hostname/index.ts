// Keep in sync with `isCalypsoLive()` in `@automattic/calypso-config`, its client-side counterpart.
const CALYPSO_LIVE_HOSTNAME_REGEX = /^([a-zA-Z0-9-]+\.)?calypso\.live$/;

/**
 * Returns true if the request hostname is calypso.live or one of its containers.
 * @param hostname The request hostname
 */
export default function isCalypsoLiveHostname( hostname?: string | null ) {
	return !! hostname && CALYPSO_LIVE_HOSTNAME_REGEX.test( hostname );
}
