import { useBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import HostingDashboardOptInBanner from 'calypso/my-sites/hosting-dashboard-opt-in-banner';
import { isMultiSiteDashboardEnabled } from 'calypso/state/sites/selectors/is-multi-site-dashboard-enabled';

export function useDashboardOptInBanner() {
	const id = 'dashboard-opt-in';
	const isDesktop = useBreakpoint( '>=782px' );
	const isMSDEnabled = useSelector( isMultiSiteDashboardEnabled );

	return {
		id,
		shouldShow() {
			return ! isDesktop && isMSDEnabled;
		},
		render() {
			return <HostingDashboardOptInBanner isMobile />;
		},
	};
}
