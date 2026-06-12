import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { isSupportSession } from '@automattic/calypso-support-session';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
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
	siteRoute,
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
import {
	SidebarBackButton,
	SidebarExpandableMenuItem,
	SidebarMenu,
	SidebarMenuItem,
} from '../../components/sidebar';
import { hasHostingFeature } from '../../utils/site-features';
import { isSiteMigrationInProgress } from '../../utils/site-status';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { canSwitchEnvironment } from '../features';
import SidebarEnvironmentSwitcher from '../site/sidebar-environment-switcher';
import SiteSwitcherItem from './site-switcher-item';
import type { Site } from '@automattic/api-core';
import type { AnyRoute } from '@tanstack/react-router';

export default function SiteSidebar() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return null;
	}

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/sites">{ __( 'Back to Sites' ) }</SidebarBackButton>
			<VStack spacing={ 4 }>
				<SidebarMenu>
					<SiteSwitcherItem site={ site } />
					{ canSwitchEnvironment( site ) && <SidebarEnvironmentSwitcher site={ site } /> }
				</SidebarMenu>
				<SiteMenuSidebar site={ site } />
			</VStack>
		</VStack>
	);
}

function SiteMenuSidebar( { site }: { site: Site } ) {
	const siteSlug = site.slug;
	const siteTypeSupports = getSiteTypeFeatureSupports( site );
	const isApmEnabled = isEnabled( 'performance/apm' );

	if ( isSiteMigrationInProgress( site ) ) {
		return null;
	}

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
			{ isAvailable( sitePerformanceRoute ) &&
				siteTypeSupports.performance &&
				( isApmEnabled ? (
					<SidebarExpandableMenuItem
						label={ __( 'Performance' ) }
						icon={ chartBar }
						to={ `/sites/${ siteSlug }/performance` }
					>
						<SidebarMenuItem to={ `/sites/${ siteSlug }/performance/frontend` }>
							{ __( 'Frontend' ) }
						</SidebarMenuItem>
						<SidebarMenuItem to={ `/sites/${ siteSlug }/performance/backend` }>
							{ __( 'Backend' ) }
						</SidebarMenuItem>
					</SidebarExpandableMenuItem>
				) : (
					<SidebarMenuItem icon={ chartBar } to={ `/sites/${ siteSlug }/performance` }>
						{ __( 'Performance' ) }
					</SidebarMenuItem>
				) ) }
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
}
