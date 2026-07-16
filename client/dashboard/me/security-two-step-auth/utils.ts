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

// The relying party ID a newly registered key is scoped to. Keys registered before scoping was
// fixed can carry a different rp_id (e.g. my.wordpress.com), which leaves them unusable at login.
export function getExpectedSecurityKeyRpId() {
	return getSecurityKeyHostname() ?? 'wordpress.com';
}

export function isSecurityKeyMisscoped( rpId: string ) {
	return rpId !== getExpectedSecurityKeyRpId();
}
