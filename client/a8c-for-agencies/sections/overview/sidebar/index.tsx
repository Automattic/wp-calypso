import OverviewSidebarHelp from './help';
import OverviewSidebarQuickLinks from './quick-links';
import OverviewSidebarResources from './resources';
import OverviewSidebarVideo from './video';

const OverviewSidebar = () => {
	return (
		<div className="overview-sidebar">
			<OverviewSidebarVideo />
			<OverviewSidebarQuickLinks />
			<OverviewSidebarResources />
			<OverviewSidebarHelp />
		</div>
	);
};

export default OverviewSidebar;
