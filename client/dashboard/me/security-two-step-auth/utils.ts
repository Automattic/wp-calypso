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
