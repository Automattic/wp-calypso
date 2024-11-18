import { FEATURE_SFTP, WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
import {
	getAdminInterface,
	getPluginsUrl,
	getSettingsUrl,
	getSiteAdminUrl,
	getSiteMonitoringUrl,
	isCustomDomain,
	isNotAtomicJetpack,
	isP2Site,
	isSimpleSite,
} from 'calypso/sites-dashboard/utils';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import type { SiteExcerptData } from '@automattic/sites';
import type { Action } from '@wordpress/dataviews';

export function useActions(): Action< SiteExcerptData >[] {
	const { __ } = useI18n();
	const dispatch = useReduxDispatch();

	return useMemo(
		() => [
			{
				id: 'launch-site',
				label: __( 'Launch site' ),
				callback: ( sites ) => {
					dispatch( launchSiteOrRedirectToLaunchSignupFlow( sites[ 0 ].ID, 'sites-dashboard' ) );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_launch_click' ) );
				},
				isEligible: ( site ) => {
					const isLaunched = site.launch_status !== 'unlaunched';
					const isA4ADevSite = site.is_a4a_dev_site;
					const isWpcomStagingSite = site.is_wpcom_staging_site;

					return ! isWpcomStagingSite && ! isLaunched && ! isA4ADevSite;
				},
			},

			{
				id: 'prepare-for-launch',
				label: __( 'Prepare for launch' ),
				callback: ( sites ) => {
					page( `/settings/general/${ sites[ 0 ].ID }` );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_prepare_for_launch_click' )
					);
				},
				isEligible: ( site ) => {
					const isLaunched = site.launch_status !== 'unlaunched';
					const isA4ADevSite = site.is_a4a_dev_site;
					const isWpcomStagingSite = site.is_wpcom_staging_site;

					return ! isWpcomStagingSite && ! isLaunched && !! isA4ADevSite;
				},
			},

			{
				id: 'settings',
				label: __( 'Site settings' ),
				callback: ( sites ) => {
					page( getSettingsUrl( sites[ 0 ].slug ) );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_settings_click' ) );
				},
			},

			{
				id: 'general-settings',
				label: __( 'General settings' ),
				isEligible: ( site ) => {
					const adminInterface = getAdminInterface( site );
					const isWpAdminInterface = adminInterface === 'wp-admin';
					return isWpAdminInterface;
				},
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const wpAdminUrl = getSiteAdminUrl( site );
					window.location.href = wpAdminUrl + 'options-general.php';
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_wpadmin_settings_click' )
					);
				},
			},

			{
				id: 'hosting',
				label: __( 'Hosting' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const hasHosting =
						site.plan?.features.active.includes( FEATURE_SFTP ) && ! site?.plan?.expired;
					page(
						hasHosting ? `/hosting-config/${ site.slug }` : `/hosting-features/${ site.slug }`
					);
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_hosting_click' ) );
				},
				isEligible: ( site ) => {
					const isSiteJetpackNotAtomic = isNotAtomicJetpack( site );
					return ! isSiteJetpackNotAtomic && ! isP2Site( site );
				},
			},

			{
				id: 'site-monitoring',
				label: __( 'Monitoring' ),
				callback: ( sites ) => {
					page( getSiteMonitoringUrl( sites[ 0 ].slug ) );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_site_monitoring_click' )
					);
				},
				isEligible: ( site ) => {
					return !! site.is_wpcom_atomic;
				},
			},

			{
				id: 'plugins',
				label: __( 'Plugins' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const wpAdminUrl = getSiteAdminUrl( site );
					const adminInterface = getAdminInterface( site );
					const isWpAdminInterface = adminInterface === 'wp-admin';
					if ( isWpAdminInterface ) {
						window.location.href = `${ wpAdminUrl }plugins.php`;
					} else {
						page( getPluginsUrl( site.slug ) );
					}
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_plugins_click' ) );
				},
				isEligible: ( site ) => {
					return ! isP2Site( site );
				},
			},

			{
				id: 'copy-site',
				label: __( 'Copy site' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					page(
						addQueryArgs( `/setup/copy-site`, {
							sourceSlug: site.slug,
						} )
					);
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_copy_site_click' ) );
				},
				isEligible: ( site ) => {
					const isWpcomStagingSite = site.is_wpcom_staging_site;
					const shouldShowSiteCopyItem =
						!! site.plan?.features.active.includes( WPCOM_FEATURES_COPY_SITE );
					return ! isWpcomStagingSite && shouldShowSiteCopyItem;
				},
			},

			{
				id: 'performance-settings',
				label: __( 'Performance settings' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const wpAdminUrl = getSiteAdminUrl( site );
					const adminInterface = getAdminInterface( site );
					const isWpAdminInterface = adminInterface === 'wp-admin';
					if ( isWpAdminInterface ) {
						window.location.href = `${ wpAdminUrl }options-general.php?page=page-optimize`;
					} else {
						page( `/settings/performance/${ site.slug }` );
					}
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_performance_settings_click' )
					);
				},
				isEligible: ( site ) => {
					const adminInterface = getAdminInterface( site );
					const isWpAdminInterface = adminInterface === 'wp-admin';
					const isClassicSimple = isWpAdminInterface && isSimpleSite( site );
					return ! isClassicSimple;
				},
			},

			{
				id: 'privacy-settings',
				label: __( 'Privacy settings' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					page( `/settings/general/${ site.slug }#site-privacy-settings` );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_privacy_settings_click' )
					);
				},
				isEligible: ( site ) => {
					const isLaunched = site.launch_status !== 'unlaunched';
					return isLaunched;
				},
			},

			{
				id: 'domains-and-dns',
				label: __( 'Domains and DNS' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					page( `/domains/manage/${ site.slug }/dns/${ site.slug }` );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_domains_and_dns_click' )
					);
				},
				isEligible: ( site ) => {
					const hasCustomDomain = isCustomDomain( site.slug );
					const isSiteJetpackNotAtomic = isNotAtomicJetpack( site );
					return hasCustomDomain && ! isSiteJetpackNotAtomic;
				},
			},

			{
				id: 'admin',
				label: __( 'WP Admin' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.location.href = site.options?.admin_url ?? '';
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_wpadmin_click' ) );
				},
			},
		],
		[ __, dispatch ]
	);
}
