import { HostingFeatures } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { __ } from '@wordpress/i18n';
import {
	backup,
	category,
	chartBar,
	code,
	formatListBullets,
	globe,
	pending,
	settings,
	shield,
} from '@wordpress/icons';
import {
	siteOverviewRoute,
	siteDeploymentsRoute,
	sitePerformanceRoute,
	siteMonitoringRoute,
	siteLogsRoute,
	siteScanRoute,
	siteBackupsRoute,
	siteDomainsRoute,
	siteSettingsRoute,
} from '../../app/router/sites';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import { SidebarExpandableMenuItem, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import { hasHostingFeature } from '../../utils/site-features';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';
import type { AnyRoute } from '@tanstack/react-router';

export const SiteMenuSidebar = ( { site }: { site: Site } ) => {
	const siteSlug = site.slug;

	const siteTypeSupports = getSiteTypeFeatureSupports( site );

	if ( hasSiteTrialEnded( site ) ) {
		return (
			<SidebarMenu>
				<SidebarMenuItem to={ `/sites/${ siteSlug }/trial-ended` }>
					{ __( 'Trial ended' ) }
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if ( site.options?.is_difm_lite_in_progress && ! isSupportSession() ) {
		return (
			<SidebarMenu>
				<SidebarMenuItem to={ `/sites/${ siteSlug }/site-building-in-progress` }>
					{ __( 'Site building' ) }
				</SidebarMenuItem>
				{ siteTypeSupports.domains && (
					<SidebarMenuItem to={ `/sites/${ siteSlug }/domains` }>
						{ __( 'Domains' ) }
					</SidebarMenuItem>
				) }
				{ siteTypeSupports.emails && (
					<SidebarMenuItem to={ `/sites/${ siteSlug }/emails` }>{ __( 'Emails' ) }</SidebarMenuItem>
				) }
			</SidebarMenu>
		);
	}

	const isAvailable = ( route: AnyRoute ) =>
		! site.__inaccessible_jetpack_error ||
		route.options.staticData?.availableToInaccessibleJetpackSites;

	return (
		<SidebarMenu>
			{ isAvailable( siteOverviewRoute ) && (
				<SidebarMenuItem
					icon={ category }
					to={ `/sites/${ siteSlug }` }
					activeOptions={ { exact: true } }
				>
					{ __( 'Overview' ) }
				</SidebarMenuItem>
			) }
			{ isAvailable( siteDeploymentsRoute ) && siteTypeSupports.deployments && (
				<SidebarMenuItem icon={ code } to={ `/sites/${ siteSlug }/deployments` }>
					{ __( 'Deployments' ) }
				</SidebarMenuItem>
			) }
			{ isAvailable( sitePerformanceRoute ) && siteTypeSupports.performance && (
				<SidebarMenuItem icon={ chartBar } to={ `/sites/${ siteSlug }/performance` }>
					{ __( 'Performance' ) }
				</SidebarMenuItem>
			) }
			{ isAvailable( siteMonitoringRoute ) && siteTypeSupports.monitoring && (
				<SidebarMenuItem icon={ pending } to={ `/sites/${ siteSlug }/monitoring` }>
					{ __( 'Monitoring' ) }
				</SidebarMenuItem>
			) }
			{ isAvailable( siteLogsRoute ) && siteTypeSupports.logs && (
				<SidebarExpandableMenuItem
					label={ __( 'Logs' ) }
					icon={ formatListBullets }
					to={ `/sites/${ siteSlug }/logs` }
				>
					<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/activity` }>
						{ __( 'Activity' ) }
					</SidebarMenuItem>
					<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/php` }>
						{ __( 'PHP errors' ) }
					</SidebarMenuItem>
					<SidebarMenuItem to={ `/sites/${ siteSlug }/logs/server` }>
						{ __( 'Web server' ) }
					</SidebarMenuItem>
				</SidebarExpandableMenuItem>
			) }
			{ isAvailable( siteScanRoute ) &&
				siteTypeSupports.scan &&
				( hasHostingFeature( site, HostingFeatures.SCAN_SELF_SERVE ) ? (
					<SidebarExpandableMenuItem
						label={ __( 'Scan' ) }
						icon={ shield }
						to={ `/sites/${ siteSlug }/scan` }
					>
						<SidebarMenuItem to={ `/sites/${ siteSlug }/scan/active` }>
							{ __( 'Active threats' ) }
						</SidebarMenuItem>
						<SidebarMenuItem to={ `/sites/${ siteSlug }/scan/history` }>
							{ __( 'History' ) }
						</SidebarMenuItem>
					</SidebarExpandableMenuItem>
				) : (
					<SidebarMenuItem icon={ shield } to={ `/sites/${ siteSlug }/scan` }>
						{ __( 'Scan' ) }
					</SidebarMenuItem>
				) ) }
			{ isAvailable( siteBackupsRoute ) && siteTypeSupports.backups && (
				<SidebarMenuItem icon={ backup } to={ `/sites/${ siteSlug }/backups` }>
					{ __( 'Backups' ) }
				</SidebarMenuItem>
			) }
			{ isAvailable( siteDomainsRoute ) && siteTypeSupports.domains && (
				<SidebarMenuItem icon={ globe } to={ `/sites/${ siteSlug }/domains` }>
					{ __( 'Domains' ) }
				</SidebarMenuItem>
			) }
			{ isAvailable( siteSettingsRoute ) &&
				siteTypeSupports.settings &&
				site.capabilities?.manage_options &&
				! isSelfHostedJetpackConnected( site ) && (
					<SidebarMenuItem icon={ settings } to={ `/sites/${ siteSlug }/settings` }>
						{ __( 'Settings' ) }
					</SidebarMenuItem>
				) }
		</SidebarMenu>
	);
};

const SiteMenu = ( { site }: { site: Site } ) => {
	const siteSlug = site.slug;

	const siteTypeSupports = getSiteTypeFeatureSupports( site );
	if ( hasSiteTrialEnded( site ) ) {
		return (
			<ResponsiveMenu label={ __( 'Site Menu' ) } prefix={ <MenuDivider /> }>
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/trial-ended` }>
					{ __( 'Trial ended' ) }
				</ResponsiveMenu.Item>
			</ResponsiveMenu>
		);
	}

	if ( site.options?.is_difm_lite_in_progress && ! isSupportSession() ) {
		return (
			<ResponsiveMenu label={ __( 'Site Menu' ) } prefix={ <MenuDivider /> }>
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/site-building-in-progress` }>
					{ __( 'Site building' ) }
				</ResponsiveMenu.Item>
				{ siteTypeSupports.domains && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/domains` }>
						{ __( 'Domains' ) }
					</ResponsiveMenu.Item>
				) }
				{ siteTypeSupports.emails && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/emails` }>
						{ __( 'Emails' ) }
					</ResponsiveMenu.Item>
				) }
			</ResponsiveMenu>
		);
	}

	const isAvailable = ( route: AnyRoute ) =>
		! site.__inaccessible_jetpack_error ||
		route.options.staticData?.availableToInaccessibleJetpackSites;

	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) } prefix={ <MenuDivider /> }>
			{ isAvailable( siteOverviewRoute ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }` } activeOptions={ { exact: true } }>
					{ __( 'Overview' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteDeploymentsRoute ) && siteTypeSupports.deployments && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/deployments` }>
					{ __( 'Deployments' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( sitePerformanceRoute ) && siteTypeSupports.performance && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/performance` }>
					{ __( 'Performance' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteMonitoringRoute ) && siteTypeSupports.monitoring && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/monitoring` }>
					{ __( 'Monitoring' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteLogsRoute ) && siteTypeSupports.logs && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/logs` }>
					{ __( 'Logs' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteScanRoute ) && siteTypeSupports.scan && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/scan` }>
					{ __( 'Scan' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteBackupsRoute ) && siteTypeSupports.backups && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/backups` }>
					{ __( 'Backups' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteDomainsRoute ) && siteTypeSupports.domains && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/domains` }>
					{ __( 'Domains' ) }
				</ResponsiveMenu.Item>
			) }
			{ isAvailable( siteSettingsRoute ) &&
				siteTypeSupports.settings &&
				site.capabilities?.manage_options &&
				! isSelfHostedJetpackConnected( site ) && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/settings` }>
						{ __( 'Settings' ) }
					</ResponsiveMenu.Item>
				) }
		</ResponsiveMenu>
	);
};

export default SiteMenu;
