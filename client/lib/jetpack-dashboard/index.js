export const JETPACK_DASHBOARD_PRIMARY_DOMAIN = 'cloud.jetpack.com';
export const JETPACK_DASHBOARD_SECONDARY_DOMAIN = 'my.jetpack.com';

const jetpackDashboardDomains = [
	JETPACK_DASHBOARD_PRIMARY_DOMAIN,
	JETPACK_DASHBOARD_SECONDARY_DOMAIN,
];

export function isJetpackDashboard() {
	return !! (
		process.env.JETPACK_DASHBOARD ||
		( typeof window !== 'undefined' &&
			jetpackDashboardDomains.indexOf( window.location.host ) >= 0 )
	);
}
