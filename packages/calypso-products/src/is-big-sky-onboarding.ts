export function isBigSkyOnboarding(): boolean {
	if ( new URLSearchParams( location.search ).has( 'big-sky-checkout' ) ) {
		return true;
	}

	return false;
}
