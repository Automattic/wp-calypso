import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSiteSlug, getSelectedSite } from 'calypso/state/ui/selectors';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import AdministrationSettings from './administration';
import AgencySettings from './agency';
import CachesSettings from './caches';
import SiteSettings from './site';
import WebServerSettings from './web-server';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function SettingsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );
	const isWpcomStaging = useSelectedSiteSelector( isSiteWpcomStaging );

	const site = useSelector( getSelectedSite );
	const isAtomicSite = site?.is_wpcom_atomic;

	const { data: agencySite } = useFetchAgencyFromBlog( site?.ID ?? 0, { enabled: !! site?.ID } );

	const shouldShowAgency = agencySite && isAtomicSite;

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/settings/site/${ slug }` }>{ __( 'Site' ) }</SidebarItem>
			{ ! isWpcomStaging && (
				<SidebarItem href={ `/sites/settings/administration/${ slug }` }>
					{ __( 'Administration' ) }
				</SidebarItem>
			) }
			{ shouldShowAgency && (
				<SidebarItem href={ `/sites/settings/agency/${ slug }` }>{ __( 'Agency' ) }</SidebarItem>
			) }
			<SidebarItem href={ `/sites/settings/caches/${ slug }` }>{ __( 'Caches' ) }</SidebarItem>
			<SidebarItem href={ `/sites/settings/web-server/${ slug }` }>
				{ __( 'Web Server' ) }
			</SidebarItem>
		</Sidebar>
	);
}

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<AdministrationSettings />
		</PanelWithSidebar>
	);
	next();
}

export function agencySettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<AgencySettings />
		</PanelWithSidebar>
	);
	next();
}

export function cachesSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<CachesSettings />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<WebServerSettings />
		</PanelWithSidebar>
	);
	next();
}
