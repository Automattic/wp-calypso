import { FEATURE_SFTP, WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import {
	SiteExcerptData,
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from '@automattic/sites';
import { useQueryClient } from '@tanstack/react-query';
import { drawerLeft, wordpress, external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import { navigate } from 'calypso/lib/navigate';
import useRestoreSiteMutation from 'calypso/sites/hooks/use-restore-site-mutation';
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
	isDisconnectedJetpackAndNotAtomic,
} from 'calypso/sites-dashboard/utils';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import type { Action } from '@wordpress/dataviews';

export function useActions( {
	openSitePreviewPane,
	selectedItem,
}: {
	openSitePreviewPane?: (
		site: SiteExcerptData,
		source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher'
	) => void;
	selectedItem?: SiteExcerptData | null;
} ): Action< SiteExcerptData >[] {
	const { __ } = useI18n();
	const dispatch = useReduxDispatch();

	const queryClient = useQueryClient();
	const reduxDispatch = useReduxDispatch();
	const { mutate: restoreSite } = useRestoreSiteMutation( {
		onSuccess() {
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'all',
				],
			} );
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'deleted',
				],
			} );
			reduxDispatch(
				successNotice( __( 'The site has been restored.' ), {
					duration: 3000,
				} )
			);
		},
		onError: ( error ) => {
			if ( error.status === 403 ) {
				reduxDispatch(
					errorNotice( __( 'Only an administrator can restore a deleted site.' ), {
						duration: 5000,
					} )
				);
			} else {
				reduxDispatch(
					errorNotice( __( 'We were unable to restore the site.' ), { duration: 5000 } )
				);
			}
		},
	} );

	const capabilities = useSelector<
		{
			currentUser: {
				capabilities: Record< string, Record< string, boolean > >;
			};
		},
		Record< string, Record< string, boolean > >
	>( ( state ) => state.currentUser.capabilities );

	return useMemo(
		() => [
			{
				id: 'site-overview',
				isPrimary: true,
				label: __( 'Overview' ),
				icon: drawerLeft,
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const adminUrl = site.options?.admin_url ?? '';
					const isAdmin = capabilities[ site.ID ]?.manage_options;
					if (
						isAdmin &&
						! isP2Site( site ) &&
						! isNotAtomicJetpack( site ) &&
						! isDisconnectedJetpackAndNotAtomic( site )
					) {
						openSitePreviewPane && openSitePreviewPane( site, 'action' );
					} else {
						navigate( adminUrl );
					}
				},
				isEligible: ( site ) => {
					if ( site.ID === selectedItem?.ID ) {
						return false;
					}
					if ( site.is_deleted ) {
						return false;
					}
					return true;
				},
			},
			{
				id: 'open-site',
				isPrimary: true,
				label: __( 'Open site' ),
				icon: external,
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const siteUrl = window.open( site.URL, '_blank' );
					if ( siteUrl ) {
						siteUrl.opener = null;
						siteUrl.focus();
					}
				},
				isEligible: ( site ) => {
					if ( site.is_deleted ) {
						return false;
					}
					return true;
				},
			},
			{
				id: 'admin',
				isPrimary: true,
				label: __( 'WP Admin' ),
				icon: wordpress,
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.location.href = site.options?.admin_url ?? '';
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_wpadmin_click' ) );
				},
				isEligible: ( site ) => {
					if ( site.is_deleted ) {
						return false;
					}
					return true;
				},
			},

			{
				id: 'launch-site',
				label: __( 'Launch site' ),
				callback: ( sites ) => {
					dispatch( launchSiteOrRedirectToLaunchSignupFlow( sites[ 0 ].ID, 'sites-dashboard' ) );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_launch_click' ) );
				},
				isEligible: ( site ) => {
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
				isEligible: ( site ) => {
					if ( site.is_deleted ) {
						return false;
					}
					return true;
				},
			},

			{
				id: 'general-settings',
				label: __( 'General settings' ),
				isEligible: ( site ) => {
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

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
					if ( site.is_deleted ) {
						return false;
					}

					const hasCustomDomain = isCustomDomain( site.slug );
					const isSiteJetpackNotAtomic = isNotAtomicJetpack( site );
					return hasCustomDomain && ! isSiteJetpackNotAtomic;
				},
			},

			{
				id: 'restore',
				label: __( 'Restore' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					restoreSite( site.ID );
				},
				isEligible: ( site ) => !! site?.is_deleted,
			},
		],
		[ __, capabilities, dispatch, openSitePreviewPane, restoreSite, selectedItem?.ID ]
	);
}
