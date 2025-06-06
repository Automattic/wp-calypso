import { isEnabled } from '@automattic/calypso-config';
import OverviewSidebarAgencyTier from './agency-tier';
import OverviewSidebarContactSupport from './contact-support';
import OverviewSidebarFeaturedWooPayments from './featured-woopayments';
import OverviewSidebarGrowthAccelerator from './growth-accelerator';
import OverviewSidebarQuickLinks from './quick-links';
import OverviewSidebarRelaunchWelcomeTour from './relaunch-welcome-tour';

const OverviewSidebar = () => {
	return (
		<div className="overview-sidebar">
			{ isEnabled( 'a4a-unified-onboarding-tour' ) && <OverviewSidebarRelaunchWelcomeTour /> }
			{ isEnabled( 'a8c-for-agencies-agency-tier' ) && <OverviewSidebarAgencyTier /> }
			<OverviewSidebarQuickLinks />
			<OverviewSidebarFeaturedWooPayments />
			<OverviewSidebarGrowthAccelerator />
			<OverviewSidebarContactSupport />
		</div>
	);
};

export default OverviewSidebar;
