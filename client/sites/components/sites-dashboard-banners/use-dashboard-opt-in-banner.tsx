import { useBreakpoint } from '@automattic/viewport-react';
import { dismissCard } from 'calypso/blocks/dismissible-card/actions';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import HostingDashboardOptInBanner from 'calypso/my-sites/hosting-dashboard-opt-in-banner';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isAdvancedNoticeVisible } from 'calypso/state/dashboard/selectors';

export function useDashboardOptInBanner() {
	const id = 'dashboard-opt-in';
	const dispatch = useDispatch();
	const isDesktop = useBreakpoint( '>=782px' );
	const isVisible = useSelector( isAdvancedNoticeVisible );
	const isDismissed = useSelector( isCardDismissed( id ) );

	const handleDismiss = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_dashboard_advance_notice_banner_dismiss' ) );
		dispatch( dismissCard( id ) );
	};

	return {
		id,
		shouldShow() {
			return ! isDesktop && isVisible && ! isDismissed;
		},
		render() {
			return <HostingDashboardOptInBanner isMobile onDismiss={ handleDismiss } />;
		},
	};
}
