declare global {
	interface Window {
		isGlobalStylesOnPersonal?: boolean;
	}
}
export function isGlobalStylesOnPersonalEnabled(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	return !! window.isGlobalStylesOnPersonal;
}
