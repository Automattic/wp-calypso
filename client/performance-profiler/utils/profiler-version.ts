export const profilerVersion = () => {
	if ( window.location.pathname.includes( '/sites/performance/' ) ) {
		return 'logged-in';
	} else if ( window.location.pathname.includes( '/speed-test-tool' ) ) {
		return 'logged-out';
	}
	return 'unknown';
};
