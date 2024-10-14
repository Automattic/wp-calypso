import OverviewSidebarContactSupport from './contact-support';
import OverviewSidebarGrowthAccelerator from './growth-accelerator';
import OverviewSidebarQuickLinks from './quick-links';

const OverviewSidebar = () => {
	return (
		<div className="overview-sidebar">
			<OverviewSidebarQuickLinks />
			<OverviewSidebarGrowthAccelerator />
			<OverviewSidebarContactSupport />
		</div>
	);
};

export default OverviewSidebar;
