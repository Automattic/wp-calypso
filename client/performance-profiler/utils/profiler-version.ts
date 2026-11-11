export const profilerVersion = () => {
	if ( window.location.pathname.includes( '/sites/performance/' ) ) {
		return 'logged-in';
	}
	return 'unknown';
};
