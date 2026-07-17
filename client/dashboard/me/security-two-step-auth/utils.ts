import { supported } from '@github/webauthn-json';

function isBrowser() {
	try {
		if ( ! window ) {
			return false;
		}
	} catch ( err ) {
		return false;
	}
	return true;
}

export function isWebAuthnSupported() {
	return isBrowser() && supported();
}

// WebAuthn requires the relying party ID to be a registrable suffix of the current origin, so
// hosts outside wordpress.com must register against their own hostname.
export function getSecurityKeyHostname() {
	const { hostname } = window.location;
	return hostname === 'wordpress.com' || hostname.endsWith( '.wordpress.com' )
		? undefined
		: hostname;
}

// Keys registered before scoping was fixed can be scoped to a wordpress.com subdomain
// (e.g. my.wordpress.com) instead of wordpress.com, which leaves them unusable at login. We key
// off the rp_id alone rather than the current host so we don't flag valid keys on non-wordpress.com
// hosts (e.g. a local dev origin).
export function isSecurityKeyMisscoped( rpId: string ) {
	return rpId !== 'wordpress.com' && rpId.endsWith( '.wordpress.com' );
}
