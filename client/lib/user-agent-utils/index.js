export function currentUserAgent() {
	return navigator.userAgent;
}

export function isChromeOS( userAgent = currentUserAgent() ) {
	return /\bCrOS\b/.test( userAgent );
}
