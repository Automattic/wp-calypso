import { SyntheticEvent } from '@wordpress/element';
import { settings } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
const managePluginsPattern = /^\/plugins\/(manage|active|inactive|updates)/;

const PluginsSidebar = ( { path, isCollapsed }: Props ) => {
	const translate = useTranslate();

	const [ previousPath, setPreviousPath ] = useState( path );
	const isManagedPluginSelected =
		managePluginsPattern.test( path ) ||
		( path.startsWith( '/plugins/' ) &&
			managePluginsPattern.test( previousPath ) &&
			! path.startsWith( '/plugins/scheduled-updates' ) );

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
					onNavigate={ ( _e: SyntheticEvent, link: string ) => setPreviousPath( link ) }
					selected={
						path.startsWith( '/plugins' ) &&
						! path.startsWith( '/plugins/scheduled-updates' ) &&
						! isManagedPluginSelected
					}
					customIcon={ <SidebarIconPlugins /> }
				/>

				<SidebarItem
					className="sidebar__menu-item--plugins"
					link="/plugins/manage/sites"
					label={ translate( 'Manage Plugins' ) }
					tooltip={ isCollapsed && translate( 'Manage Plugins' ) }
					selected={ isManagedPluginSelected }
					icon={ settings }
					onNavigate={ ( _e: SyntheticEvent, link: string ) => setPreviousPath( link ) }
				/>

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
