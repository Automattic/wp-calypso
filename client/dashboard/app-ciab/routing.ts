const CIAB_DASHBOARD_ALLOWED_HOSTNAMES = [ 'my.woo.localhost', 'my.woo.com' ];

export function isAllowedCiabDashboardHostname( hostname?: string ): boolean {
	return CIAB_DASHBOARD_ALLOWED_HOSTNAMES.includes( hostname ?? '' );
}

export function getCiabDashboardBasePath( hostname: string ): string {
	return isAllowedCiabDashboardHostname( hostname ) ? '/' : '/ciab';
}
