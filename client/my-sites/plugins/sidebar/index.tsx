import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import GlobalSidebar from 'calypso/layout/global-sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import { SidebarIconPlugins } from '../../sidebar/static-data/global-sidebar-menu';
import { SidebarIconCalendar } from './icons';
import './style.scss';

interface Props {
	path: string;
	isCollapsed: boolean;
}
const PluginsSidebar = ( { path, isCollapsed }: Props ) => {
	const translate = useTranslate();

	return (
		<GlobalSidebar
			className={ clsx( 'sidebar--plugins', { 'is-collapsed': isCollapsed } ) }
			siteTitle={ ! isCollapsed && translate( 'Plugins' ) }
			requireBackLink
			backLinkHref="/sites"
			subHeading={
				! isCollapsed &&
				translate(
					"Enhance your site's features with plugins, or schedule updates to fit your needs."
				)
			}
		>
			<SidebarMenu>
				<SidebarItem
					className="sidebar__menu-item--plugins"
					link="/plugins"
					label={ translate( 'Marketplace' ) }
					tooltip={ isCollapsed && translate( 'Marketplace' ) }
					selected={
						path.startsWith( '/plugins' ) &&
						! path.startsWith( '/plugins/scheduled-updates' ) &&
						! path.startsWith( '/plugins/manage' )
					}
					customIcon={ <SidebarIconPlugins /> }
				/>
				<SidebarItem
					className="sidebar__menu-item--plugins"
					link="/plugins/scheduled-updates"
					label={ translate( 'Scheduled Updates' ) }
					tooltip={ isCollapsed && translate( 'Scheduled Updates' ) }
					selected={ path.startsWith( '/plugins/scheduled-updates' ) }
					customIcon={ <SidebarIconCalendar /> }
				/>
				<SidebarItem
					className="sidebar__menu-item--plugins"
					link="/plugins/manage"
					label={ translate( 'Manage plugins' ) }
					tooltip={ isCollapsed && translate( 'Manage plugins' ) }
					selected={ path.startsWith( '/plugins/manage' ) }
					customIcon={ <SidebarIconPlugins /> }
				/>
			</SidebarMenu>
		</GlobalSidebar>
	);
};

export default PluginsSidebar;
