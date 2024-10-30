import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import AdministrationSettings from 'calypso/my-sites/site-settings/administration';
import AgencySettings from 'calypso/my-sites/site-settings/agency';
import CachesSettings from 'calypso/my-sites/site-settings/caches';
import SiteSettings from 'calypso/my-sites/site-settings/site';
import WebServerSettings from 'calypso/my-sites/site-settings/web-server';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function SettingsSideBar( { selectedItemKey }: { selectedItemKey: string } ) {
	const slug = useSelector( getSelectedSiteSlug );
	const isWpcomStaging = useSelectedSiteSelector( isSiteWpcomStaging );

	return (
		<Sidebar selectedItemKey={ selectedItemKey }>
			<SidebarItem itemKey="site" href={ `/sites/settings/site/${ slug }` }>
				{ __( 'Site' ) }
			</SidebarItem>
			{ ! isWpcomStaging && (
				<SidebarItem itemKey="administration" href={ `/sites/settings/administration/${ slug }` }>
					{ __( 'Administration' ) }
				</SidebarItem>
			) }
			<SidebarItem itemKey="agency" href={ `/sites/settings/agency/${ slug }` }>
				{ __( 'Agency' ) }
			</SidebarItem>
			<SidebarItem itemKey="caches" href={ `/sites/settings/caches/${ slug }` }>
				{ __( 'Caches' ) }
			</SidebarItem>
			<SidebarItem itemKey="web-server" href={ `/sites/settings/web-server/${ slug }` }>
				{ __( 'Web Server' ) }
			</SidebarItem>
		</Sidebar>
	);
}

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSideBar selectedItemKey="site" />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSideBar selectedItemKey="administration" />
			<AdministrationSettings />
		</PanelWithSidebar>
	);
	next();
}

export function agencySettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSideBar selectedItemKey="agency" />
			<AgencySettings />
		</PanelWithSidebar>
	);
	next();
}

export function cachesSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSideBar selectedItemKey="caches" />
			<CachesSettings />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSideBar selectedItemKey="web-server" />
			<WebServerSettings />
		</PanelWithSidebar>
	);
	next();
}
