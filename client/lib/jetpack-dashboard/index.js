export function isJetpackDashboard() {
	return !! (
		process.env.JETPACK_DASHBOARD ||
		( typeof window !== 'undefined' && 'dashboard.jetpack.com' === window.location.host )
	);
}
