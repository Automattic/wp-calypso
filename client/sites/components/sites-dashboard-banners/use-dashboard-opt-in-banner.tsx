import { useBreakpoint } from '@automattic/viewport-react';
import HostingDashboardOptInBanner from 'calypso/my-sites/hosting-dashboard-opt-in-banner';

export function useDashboardOptInBanner() {
	const id = 'dashboard-opt-in';
	const isDesktop = useBreakpoint( '>=782px' );

	return {
		id,
		shouldShow() {
			return ! isDesktop;
		},
		render() {
			return <HostingDashboardOptInBanner isMobile />;
		},
	};
}
