import { isSupportSession } from '@automattic/calypso-support-session';
import { __ } from '@wordpress/i18n';
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
