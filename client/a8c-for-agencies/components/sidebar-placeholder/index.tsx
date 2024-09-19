import Sidebar, {
	SidebarV2Header as SidebarHeader,
	SidebarV2Main as SidebarMain,
	SidebarV2Footer as SidebarFooter,
} from 'calypso/layout/sidebar-v2';

import '../sidebar/style.scss'; // Need to import styling from sidebar.
import './style.scss';

export default function A4ASidebarPlaceholder() {
	return (
		<Sidebar className="a4a-sidebar a4a-sidebar-placeholder">
			<SidebarHeader className="a4a-sidebar__header">
				<div className="a4a-sidebar-placeholder__header-icon"></div>
			</SidebarHeader>

			<SidebarMain>
				<div className="a4a-sidebar-placeholder__menu-item"></div>
				<div className="a4a-sidebar-placeholder__menu-item"></div>
			</SidebarMain>

			<SidebarFooter>
				<div className="a4a-sidebar-placeholder__menu-item"></div>
			</SidebarFooter>
		</Sidebar>
	);
}
