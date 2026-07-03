import { useBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import HostingDashboardOptInBanner from 'calypso/my-sites/hosting-dashboard-opt-in-banner';
import { isAdvancedNoticeVisible } from 'calypso/state/dashboard/selectors';

export function useDashboardOptInBanner() {
	const id = 'dashboard-opt-in';
	const isDesktop = useBreakpoint( '>=782px' );
	const isVisible = useSelector( isAdvancedNoticeVisible );

	return {
		id,
		shouldShow() {
			return ! isDesktop && isVisible;
		},
		render() {
			return <HostingDashboardOptInBanner isMobile />;
		},
	};
}
