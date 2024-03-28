import OverviewSidebarContactSupport from './contact-support';
import OverviewSidebarQuickLinks from './quick-links';

const OverviewSidebar = () => {
	return (
		<div className="overview-sidebar">
			<OverviewSidebarQuickLinks />
			<OverviewSidebarContactSupport />
		</div>
	);
};

export default OverviewSidebar;
