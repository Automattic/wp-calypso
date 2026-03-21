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
import { SidebarExpandableMenuItem, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import { hasHostingFeature } from '../../utils/site-features';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';
import type { AnyRoute } from '@tanstack/react-router';

const SiteMenu = ( { site }: { site: Site } ) => {
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
					defaultTo={ `/sites/${ siteSlug }/logs/activity` }
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
						defaultTo={ `/sites/${ siteSlug }/scan/active` }
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

export default SiteMenu;
