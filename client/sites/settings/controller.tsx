import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getRouteFromContext } from 'calypso/utils';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import { useBreadcrumbs } from '../hooks/breadcrumbs/use-breadcrumbs';
import {
	areAdvancedHostingFeaturesSupported,
	areHostingFeaturesSupported,
	useAreAdvancedHostingFeaturesSupported,
	useAreHostingFeaturesSupported,
} from '../hosting-features/features';
import DeleteSite from './administration/tools/delete-site';
import ResetSite from './administration/tools/reset-site';
import TransferSite from './administration/tools/transfer-site';
import DatabaseSettings from './database';
import PerformanceSettings from './performance';
import ServerSettings from './server';
import SftpSshSettings from './sftp-ssh';
import useSftpSshSettingTitle from './sftp-ssh/hooks/use-sftp-ssh-setting-title';
import SiteSettings from './site';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function SettingsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );
	const isSimple = useSelector( isSimpleSite );
	const sftpSshTitle = useSftpSshSettingTitle();

	const areHostingFeaturesSupported = useAreHostingFeaturesSupported();
	const areAdvancedHostingFeaturesSupported = useAreAdvancedHostingFeaturesSupported();

	const { shouldShowBreadcrumbs } = useBreadcrumbs();

	if ( isSimple || shouldShowBreadcrumbs ) {
		return null;
	}

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/settings/site/${ slug }` }>{ __( 'General' ) }</SidebarItem>
			{ ! config.isEnabled( 'untangling/settings-i2' ) && areAdvancedHostingFeaturesSupported && (
				<SidebarItem href={ `/hosting-config/${ slug }` }>{ __( 'Server' ) }</SidebarItem>
			) }
			{ config.isEnabled( 'untangling/settings-i2' ) && areAdvancedHostingFeaturesSupported && (
				<>
					<SidebarItem href={ `/sites/settings/server/${ slug }` }>{ __( 'Server' ) }</SidebarItem>
					<SidebarItem href={ `/sites/settings/sftp-ssh/${ slug }` }>{ sftpSshTitle }</SidebarItem>
					<SidebarItem href={ `/sites/settings/database/${ slug }` }>
						{ __( 'Database' ) }
					</SidebarItem>
				</>
			) }
			{ config.isEnabled( 'untangling/settings-i2' ) && areHostingFeaturesSupported && (
				<SidebarItem href={ `/sites/settings/performance/${ slug }` }>
					{ __( 'Performance' ) }
				</SidebarItem>
			) }
		</Sidebar>
	);
}

export async function redirectToHostingConfigIfDuplicatedViewsDisabled(
	context: PageJSContext,
	next: () => void
) {
	const { getState, dispatch } = context.store;
	const isUntangled = await isRemoveDuplicateViewsExperimentEnabled( getState, dispatch );
	const siteSlug = getSelectedSiteSlug( getState() );

	if ( ! isUntangled || ! config.isEnabled( 'untangling/settings-i2' ) ) {
		// Redirect command palette routes to the new hosting config page when not in the treatment group
		const routes = {
			[ `/sites/settings/server/${ siteSlug }` ]: `/hosting-config/${ siteSlug }`,
			[ `/sites/settings/performance/${ siteSlug }` ]: `/hosting-config/${ siteSlug }#cache`,
			[ `/sites/settings/database/${ siteSlug }` ]: `/hosting-config/${ siteSlug }#database-access`,
			[ `/sites/settings/sftp-ssh/${ siteSlug }` ]: `/hosting-config/${ siteSlug }#sftp-credentials`,
		};

		return page.redirect( routes[ context.path ] ?? `/hosting-config/${ siteSlug }` );
	}

	next();
}

export function redirectToSiteSettingsIfHostingFeaturesNotSupported(
	context: PageJSContext,
	next: () => void
) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( ! areHostingFeaturesSupported( site ) ) {
		return page.redirect( `/sites/settings/site/${ site?.slug }` );
	}

	next();
}

export function redirectToSiteSettingsIfAdvancedHostingFeaturesNotSupported(
	context: PageJSContext,
	next: () => void
) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( areAdvancedHostingFeaturesSupported( state ) === false ) {
		return page.redirect( `/sites/settings/site/${ site?.slug }` );
	}

	next();
}

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker title="Sites > Settings > General" path={ getRouteFromContext( context ) } />
			<SettingsSidebar />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationToolResetSite( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Reset site"
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
				title="Sites > Settings > Transfer site"
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
				title="Sites > Settings > Delete site"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<DeleteSite />
		</PanelWithSidebar>
	);
	next();
}

export function serverSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker title="Sites > Settings > Server" path={ getRouteFromContext( context ) } />
			<SettingsSidebar />
			<ServerSettings />
		</PanelWithSidebar>
	);
	next();
}

export function sftpSshSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > SFTP/SSH"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<SftpSshSettings />
		</PanelWithSidebar>
	);
	next();
}

export function databaseSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Database"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<DatabaseSettings />
		</PanelWithSidebar>
	);
	next();
}

export function performanceSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<PageViewTracker
				title="Sites > Settings > Performance"
				path={ getRouteFromContext( context ) }
			/>
			<SettingsSidebar />
			<PerformanceSettings />
		</PanelWithSidebar>
	);
	next();
}
