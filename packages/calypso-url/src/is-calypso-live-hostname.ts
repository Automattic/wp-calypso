// calypso.live matches
// hash-abcd1234.calypso.live matches
// calypso.live.com doesn't match
const CALYPSO_LIVE_HOSTNAME_REGEX = /^([a-zA-Z0-9-]+\.)?calypso\.live$/;

/**
 * Checks if a hostname is calypso.live or one of its containers (e.g. `hash-abcd1234.calypso.live`).
 *
 * In the browser, pass `window.location.hostname`. On the server, pass the request hostname: the
 * same server can be reached on other hostnames, so there is no process-wide answer.
 * @param hostname The hostname to check
 * @returns true if the hostname is a calypso.live hostname
 */
export function isCalypsoLiveHostname( hostname?: string | null ): boolean {
	return !! hostname && CALYPSO_LIVE_HOSTNAME_REGEX.test( hostname );
}
