import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
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

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/settings/site/${ slug }` }>{ __( 'Site' ) }</SidebarItem>
			<SidebarItem enabled={ ! isWpcomStaging } href={ `/sites/settings/administration/${ slug }` }>
				{ __( 'Administration' ) }
			</SidebarItem>
			<SidebarItem href={ `/sites/settings/agency/${ slug }` }>{ __( 'Agency' ) }</SidebarItem>
			<SidebarItem href={ `/sites/settings/caches/${ slug }` }>{ __( 'Caches' ) }</SidebarItem>
			<SidebarItem href={ `/sites/settings/web-server/${ slug }` }>
				{ __( 'Web Server' ) }
			</SidebarItem>
		</Sidebar>
	);
}

function SettingsNotSupportedNotice( { message }: { message: string } ) {
	return (
		<Notice showDismiss={ false } status="is-warning">
			{ message }
		</Notice>
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
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			{ ! isSiteWpcomStaging( state, siteId ) ? (
				<AdministrationSettings />
			) : (
				<SettingsNotSupportedNotice
					message={ __( 'This setting is not supported for staging sites.' ) }
				/>
			) }
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
