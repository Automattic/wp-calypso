export function isRelativeUrl( url: string ) {
	try {
		return new URL( url, window.location.href ).origin === window.location.origin;
	} catch {
		return false;
	}
}
