import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
import SitePreviewLink from 'calypso/components/site-preview-link';
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
					window.location.href = `https://wordpress.com/settings/general/${ sites[ 0 ].ID }`;
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
					window.location.href = getSettingsUrl( sites[ 0 ].slug );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_settings_click' ) );
				},
			},

			{
				id: 'hosting',
				label: __( 'Hosting' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const hasHosting =
						/* useSafeSiteHasFeature( site.ID, FEATURE_SFTP ) && */ ! site?.plan?.expired;

					window.location.href = hasHosting
						? `hosting-config/${ site.slug }`
						: `/hosting-features/${ site.slug }`;
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_hosting_click' ) );
				},
				isEligible: ( site ) => {
					const isSiteJetpackNotAtomic = isNotAtomicJetpack( site );
					return ! isSiteJetpackNotAtomic && ! isP2Site( site );
				},
			},

			{
				id: 'site-monitoring',
				// The label here used to change depending on whether the site uses WPAdmin or not.
				label: __( 'Monitoring' ),
				callback: ( sites ) => {
					window.location.href = getSiteMonitoringUrl( sites[ 0 ].slug );
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

					window.location.href = isWpAdminInterface
						? `${ wpAdminUrl }plugins.php`
						: getPluginsUrl( site.slug );

					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_plugins_click' ) );
				},
				isEligible: ( site ) => {
					return ! isP2Site( site );
				},
			},

			{
				id: 'share-site-for-preview',
				label: __( 'Share site for preview' ),
				RenderModal: ( { items: sites } ) => {
					const site = sites[ 0 ];
					return <SitePreviewLink siteUrl={ site.URL } siteId={ site.ID } source="smp-modal" />;
				},
				isEligible: ( site ) => {
					/* const hasSitePreviewLinksFeature = useSafeSiteHasFeature(
						site.ID,
						WPCOM_FEATURES_SITE_PREVIEW_LINKS
					);

					if ( ! hasSitePreviewLinksFeature ) {
						return false;
					} */

					return !! site.is_coming_soon;
				},
			},

			{
				id: 'copy-site',
				label: __( 'Copy site' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.location.href = addQueryArgs( `/setup/copy-site`, {
						sourceSlug: site.slug,
					} );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_copy_site_click' ) );
				},
				isEligible: ( site ) => {
					const isWpcomStagingSite = site.is_wpcom_staging_site;

					/* const shouldShowSiteCopyItem = useSafeSiteHasFeature(
						site?.ID,
						WPCOM_FEATURES_COPY_SITE
					);
					return ! isWpcomStagingSite && shouldShowSiteCopyItem; */
					return ! isWpcomStagingSite;
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
					window.location.href = isWpAdminInterface
						? `${ wpAdminUrl }options-general.php?page=page-optimize`
						: `/settings/performance/${ site.slug }`;
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
					window.location.href = `/settings/general/${ site.slug }#site-privacy-settings`;
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
					window.location.href = `/domains/manage/${ site.slug }/dns/${ site.slug }`;
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
