export const profilerVersion = () =>
	window.location.pathname.includes( '/sites/performance/' ) ? 'logged-in' : 'logged-out';
