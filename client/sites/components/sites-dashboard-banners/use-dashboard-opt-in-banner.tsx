import { useBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import HostingDashboardOptInBanner from 'calypso/my-sites/hosting-dashboard-opt-in-banner';
import { isDashboardEnabled } from 'calypso/state/dashboard/selectors/is-dashboard-enabled';

export function useDashboardOptInBanner() {
	const id = 'dashboard-opt-in';
	const isDesktop = useBreakpoint( '>=782px' );
	const dashboardEnabled = useSelector( isDashboardEnabled );

	return {
		id,
		shouldShow() {
			return ! isDesktop && dashboardEnabled;
		},
		render() {
			return <HostingDashboardOptInBanner isMobile />;
		},
	};
}
