import config from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getRouteFromContext } from 'calypso/utils';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import AdministrationSettings from './administration';
import useIsAdministrationSettingSupported from './administration/hooks/use-is-administration-setting-supported';
import DeleteSite from './administration/tools/delete-site';
import ResetSite from './administration/tools/reset-site';
import TransferSite from './administration/tools/transfer-site';
import CachingSettings from './caching';
import SiteSettings from './site';
import WebServerSettings from './web-server';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function SettingsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );
	const isSimple = useSelector( isSimpleSite );
	const shouldShowAdministration = useIsAdministrationSettingSupported();

	if ( isSimple ) {
		return null;
	}

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/settings/site/${ slug }` }>{ __( 'General' ) }</SidebarItem>
			<SidebarItem href={ `/hosting-config/${ slug }` }>{ __( 'Server' ) }</SidebarItem>
			{ config.isEnabled( 'untangling/hosting-menu' ) && (
				<>
					<SidebarItem
						enabled={ shouldShowAdministration }
						href={ `/sites/settings/administration/${ slug }` }
					>
						{ __( 'Administration' ) }
					</SidebarItem>
					<SidebarItem href={ `/sites/settings/caching/${ slug }` }>
						{ __( 'Caching' ) }
					</SidebarItem>
					<SidebarItem href={ `/sites/settings/web-server/${ slug }` }>
						{ __( 'Web server' ) }
					</SidebarItem>
				</>
			) }
		</Sidebar>
	);
}

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker title="Sites > Settings > Site" path={ getRouteFromContext( context ) } />
			<SettingsSidebar />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Administration"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<AdministrationSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationToolResetSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Administration > Reset site"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<ResetSite />
		</PanelWithSidebar>
	);
	next();
}

export function administrationToolTransferSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Administration > Transfer site"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<TransferSite />
		</PanelWithSidebar>
	);
	next();
}

export function administrationToolDeleteSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Administration > Delete site"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<DeleteSite />
		</PanelWithSidebar>
	);
	next();
}

export function cachingSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker title="Sites > Settings > Caching" path={ getRouteFromContext( context ) } />
			<SettingsSidebar />
			<CachingSettings />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Web server"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<WebServerSettings />
		</PanelWithSidebar>
	);
	next();
}
