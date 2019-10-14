const jetpackDashboardDomains = [ 'cloud.jetpack.com', 'my.jetpack.com' ];

export function isJetpackDashboard() {
	return !! (
		process.env.JETPACK_DASHBOARD ||
		( typeof window !== 'undefined' &&
			jetpackDashboardDomains.indexOf( window.location.host ) >= 0 )
	);
}
