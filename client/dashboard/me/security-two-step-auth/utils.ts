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
