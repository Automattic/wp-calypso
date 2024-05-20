import clsx from 'classnames';
import { useTranslate } from 'i18n-calypso';
import GlobalSidebar from 'calypso/layout/global-sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
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
		>
			<p className="sidebar__description">
				{ translate(
					'Streamline your workflow with scheduled updates, timed to suit your needs.'
				) }
			</p>
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
