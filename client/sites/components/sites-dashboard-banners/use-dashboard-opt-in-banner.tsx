import { useBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import HostingDashboardOptInBanner from 'calypso/my-sites/hosting-dashboard-opt-in-banner';
import { isInDashboardRolloutCohort } from 'calypso/state/dashboard/selectors';

export function useDashboardOptInBanner() {
	const id = 'dashboard-opt-in';
	const isDesktop = useBreakpoint( '>=782px' );
	const inRolloutCohort = useSelector( isInDashboardRolloutCohort );

	return {
		id,
		shouldShow() {
			return ! isDesktop && inRolloutCohort;
		},
		render() {
			return <HostingDashboardOptInBanner isMobile />;
		},
	};
}
