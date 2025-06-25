export function isPartnerBundleOnboarding(): boolean {
	if ( new URLSearchParams( location.search ).has( 'partnerBundle' ) ) {
		return true;
	}

	return false;
}
