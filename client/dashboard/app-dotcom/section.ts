import { isAllowedCiabDashboardHost } from '../app-ciab/section';

export const DOTCOM_DASHBOARD_SECTION_DEFINITION = {
	name: 'dashboard-dotcom',
	module: 'dashboard/app-dotcom',
};

export function isAllowedDotcomDashboardHost( host?: string ): boolean {
	return ! isAllowedCiabDashboardHost( host );
}
