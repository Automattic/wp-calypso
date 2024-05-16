import { useTranslate } from 'i18n-calypso';
import GlobalSidebar from 'calypso/layout/global-sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import { SidebarIconCalendar } from './icons';

interface Props {
	path: string;
	isCollapsed: boolean;
}
const PluginsSidebar = ( { path, isCollapsed }: Props ) => {
	const translate = useTranslate();

	return (
		<GlobalSidebar
			className={ isCollapsed ? 'is-collapsed' : '' }
			siteTitle={ ! isCollapsed && translate( 'Plugins' ) }
			requireBackLink={ true }
			backLinkHref="/sites"
		>
			<SidebarMenu>
				<SidebarItem
					className="sidebar__menu-item--plugins"
					link="/plugins/scheduled-updates"
					label={ translate( 'Scheduled Updates' ) }
					tooltip={ isCollapsed && translate( 'Scheduled Updates' ) }
					selected={ path.startsWith( '/plugins/scheduled-updates' ) }
					customIcon={ <SidebarIconCalendar /> }
				/>
			</SidebarMenu>
		</GlobalSidebar>
	);
};

export default PluginsSidebar;
