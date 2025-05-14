import { getPlanPath, WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import {
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
	SiteExcerptData,
} from '@automattic/sites';
import { useQueryClient } from '@tanstack/react-query';
import { sprintf } from '@wordpress/i18n';
import { backup, drawerLeft, external, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import useRestoreSiteMutation from 'calypso/sites/hooks/use-restore-site-mutation';
import {
	getAdminInterface,
	getPluginsUrl,
	getSiteAdminUrl,
	isCustomDomain,
	isDisconnectedJetpackAndNotAtomic,
	isNotAtomicJetpack,
	isP2Site,
	isSimpleSite,
	isStagingSite,
	isSitePreviewPaneEligible,
} from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import type { Action, RenderModalProps } from '@wordpress/dataviews';

type Capabilities = Record< string, Record< string, boolean > >;

export const isActionEligible = (
	id: string,
	capabilities: Capabilities
): ( ( site: SiteExcerptData ) => boolean ) => {
	const canOpenHosting = ( site: SiteExcerptData ) => {
		const canManageOptions = capabilities[ site.ID ]?.manage_options;
		if ( site.is_deleted || ! isSitePreviewPaneEligible( site, canManageOptions ) ) {
			return false;
		}
		return true;
	};

	switch ( id ) {
		case 'site-overview':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}
				return true;
			};
		case 'open-site':
			return ( site: SiteExcerptData ) => {
				if ( site.is_deleted ) {
					return false;
				}
				return true;
			};
		case 'admin':
			return ( site: SiteExcerptData ) => {
				if ( site.is_deleted ) {
					return false;
				}
				return true;
			};
		case 'launch-site':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				const isLaunched = site.launch_status !== 'unlaunched';
				const isA4ADevSite = site.is_a4a_dev_site;
				const isWpcomStagingSite = site.is_wpcom_staging_site;

				return ! isWpcomStagingSite && ! isLaunched && ! isA4ADevSite;
			};
		case 'prepare-for-launch':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				const isLaunched = site.launch_status !== 'unlaunched';
				const isA4ADevSite = site.is_a4a_dev_site;
				const isWpcomStagingSite = site.is_wpcom_staging_site;

				return ! isWpcomStagingSite && ! isLaunched && !! isA4ADevSite;
			};
		case 'settings':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				if (
					site.is_deleted ||
					! canManageOptions ||
					isNotAtomicJetpack( site ) ||
					isDisconnectedJetpackAndNotAtomic( site )
				) {
					return false;
				}
				return true;
			};
		case 'general-settings':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				if (
					site.is_deleted ||
					! canManageOptions ||
					isNotAtomicJetpack( site ) ||
					isDisconnectedJetpackAndNotAtomic( site )
				) {
					return false;
				}

				const adminInterface = getAdminInterface( site );
				const isWpAdminInterface = adminInterface === 'wp-admin';
				return isWpAdminInterface;
			};
		case 'hosting':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				return true;
			};
		case 'site-monitoring':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				return !! site.is_wpcom_atomic;
			};
		case 'plugins':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				if ( site.is_deleted || ! canManageOptions || isP2Site( site ) ) {
					return false;
				}

				return true;
			};
		case 'copy-site':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				const isWpcomStagingSite = site.is_wpcom_staging_site;
				const shouldShowSiteCopyItem =
					!! site.plan?.features.active.includes( WPCOM_FEATURES_COPY_SITE );
				return ! isWpcomStagingSite && shouldShowSiteCopyItem;
			};
		case 'performance-settings':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				const adminInterface = getAdminInterface( site );
				const isWpAdminInterface = adminInterface === 'wp-admin';
				const isClassicSimple = isWpAdminInterface && isSimpleSite( site );
				return ! isClassicSimple;
			};
		case 'privacy-settings':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				if (
					site.is_deleted ||
					! canManageOptions ||
					isNotAtomicJetpack( site ) ||
					isDisconnectedJetpackAndNotAtomic( site )
				) {
					return false;
				}

				const isLaunched = site.launch_status !== 'unlaunched';
				return isLaunched;
			};
		case 'domains-and-dns':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				const hasCustomDomain = isCustomDomain( site.slug );
				return hasCustomDomain;
			};
		case 'restore':
			return ( site: SiteExcerptData ) => {
				// For deleted sites, the `manage_options` capability is not returned so we  don't check for it here
				// But this setting is guarded in the backend:
				// https://github.a8c.com/Automattic/wpcom/blob/4508b82936f1502b580d49574b63aad3b6dc1c5a/wp-content/rest-api-plugins/endpoints/site-restore.php#L47
				if (
					isP2Site( site ) ||
					isNotAtomicJetpack( site ) ||
					isDisconnectedJetpackAndNotAtomic( site )
				) {
					return false;
				}

				return !! site?.is_deleted;
			};
		case 'jetpack-cloud':
		case 'jetpack-billing':
		case 'jetpack-support':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				if (
					site.is_deleted ||
					! canManageOptions ||
					isP2Site( site ) ||
					isDisconnectedJetpackAndNotAtomic( site )
				) {
					return false;
				}

				return isNotAtomicJetpack( site );
			};
		case 'migrate-to-wpcom':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				if ( site.is_deleted || ! canManageOptions || isP2Site( site ) ) {
					return false;
				}

				return isNotAtomicJetpack( site ) || !! isDisconnectedJetpackAndNotAtomic( site );
			};
		case 'delete-site':
			return ( site: SiteExcerptData ) => {
				const canManageOptions = capabilities[ site.ID ]?.manage_options;
				return (
					! site.is_deleted &&
					canManageOptions &&
					( ! site.jetpack || !! site.is_wpcom_atomic ) &&
					! site.is_vip
				);
			};
		case 'leave-site':
			return ( site: SiteExcerptData ) => {
				if ( isP2Site( site ) ) {
					return false;
				}

				return true;
			};
		default:
			return () => true;
	}
};

export function useActions( {
	openSitePreviewPane,
	viewType,
}: {
	openSitePreviewPane?: (
		site: SiteExcerptData,
		source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher'
	) => void;
	viewType: 'list' | 'table' | 'grid';
} ): Action< SiteExcerptData >[] {
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

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
			dispatch( successNotice( __( 'The site has been restored.' ), { duration: 3000 } ) );
		},
		onError: ( error ) => {
			if ( error.status === 403 ) {
				dispatch(
					errorNotice( __( 'Only an administrator can restore a deleted site.' ), {
						duration: 5000,
					} )
				);
			} else {
				dispatch( errorNotice( __( 'We were unable to restore the site.' ), { duration: 5000 } ) );
			}
		},
	} );

	const capabilities = useSelector<
		{
			currentUser: {
				capabilities: Capabilities;
			};
		},
		Capabilities
	>( ( state ) => state.currentUser.capabilities );

	return useMemo(
		() => [
			...( viewType !== 'list'
				? [
						{
							id: 'site-overview',
							isPrimary: true,
							label: __( 'Overview' ),
							icon: drawerLeft,
							callback: ( sites: SiteExcerptData[] ) => {
								const site = sites[ 0 ];
								openSitePreviewPane && openSitePreviewPane( site, 'action' );
							},
							isEligible: isActionEligible( 'site-overview', capabilities ),
						},
				  ]
				: [] ),
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
				isEligible: isActionEligible( 'open-site', capabilities ),
			},
			{
				id: 'admin',
				isPrimary: true,
				label: __( 'WP Admin' ),
				icon: wordpress,
				callback: ( sites ) => {
					const site = sites[ 0 ];
					if ( site?.is_wpcom_atomic ) {
						const message = sprintf(
							/* translators: siteTitle is the website's title. */
							__( 'Logging you into %(siteTitle)s' ),
							{
								siteTitle: site.title,
							}
						);
						dispatch( infoNotice( message ) );
					}
					window.location.href = site.options?.admin_url ?? '';
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_wpadmin_click' ) );
				},
				isEligible: isActionEligible( 'admin', capabilities ),
			},

			{
				id: 'launch-site',
				label: __( 'Launch site' ),
				callback: ( sites ) => {
					dispatch( launchSiteOrRedirectToLaunchSignupFlow( sites[ 0 ].ID, 'sites-dashboard' ) );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_launch_click' ) );
				},
				isEligible: isActionEligible( 'launch-site', capabilities ),
			},

			// https://github.com/Automattic/wp-calypso/pull/93737
			{
				id: 'prepare-for-launch',
				label: __( 'Prepare for launch' ),
				callback: ( sites ) => {
					page( `/sites/settings/site/${ sites[ 0 ].ID }` );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_prepare_for_launch_click' )
					);
				},
				isEligible: isActionEligible( 'prepare-for-launch', capabilities ),
			},

			{
				id: 'general-settings',
				label: __( 'General settings' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const wpAdminUrl = getSiteAdminUrl( site );
					window.location.href = wpAdminUrl + 'options-general.php';
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_wpadmin_settings_click' )
					);
				},
				isEligible: isActionEligible( 'general-settings', capabilities ),
			},

			{
				id: 'plugins',
				label: __( 'Plugins' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const wpAdminUrl = getSiteAdminUrl( site );
					const adminInterface = getAdminInterface( site );
					const isWpAdminInterface = adminInterface === 'wp-admin';
					const isSelfHostedJetpack = isNotAtomicJetpack( site );
					if ( isWpAdminInterface || isSelfHostedJetpack ) {
						window.location.href = `${ wpAdminUrl }plugins.php`;
					} else {
						page( getPluginsUrl( site.slug ) );
					}
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_plugins_click' ) );
				},
				isEligible: isActionEligible( 'plugins', capabilities ),
			},

			{
				id: 'copy-site',
				label: __( 'Copy site' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					page(
						addQueryArgs( '/setup/copy-site', {
							sourceSlug: site.slug,
							plan: getPlanPath( site.plan?.product_slug ?? 'business' ),
						} )
					);
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_copy_site_click' ) );
				},
				isEligible: isActionEligible( 'copy-site', capabilities ),
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
				isEligible: isActionEligible( 'domains-and-dns', capabilities ),
			},

			{
				id: 'restore',
				isPrimary: true,
				icon: backup,
				label: __( 'Restore' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					restoreSite( site.ID );
				},
				isEligible: isActionEligible( 'restore', capabilities ),
			},

			// Jetpack menu items
			{
				id: 'jetpack-cloud',
				label: __( 'Jetpack Cloud' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.location.href = `https://cloud.jetpack.com/landing/${ site.slug }`;
					recordTracksEvent( 'calypso_sites_dashboard_site_action_jetpack_cloud_click' );
				},
				isEligible: isActionEligible( 'jetpack-cloud', capabilities ),
			},
			{
				id: 'jetpack-billing',
				label: __( 'Billing' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.location.href = `https://cloud.jetpack.com/purchases/${ site.slug }`;
					recordTracksEvent( 'calypso_sites_dashboard_site_action_jetpack_billing_click' );
				},
				isEligible: isActionEligible( 'jetpack-billing', capabilities ),
			},
			{
				id: 'jetpack-support',
				label: __( 'Support' ),
				callback: () => {
					window.location.href = 'https://jetpack.com/support';
					recordTracksEvent( 'calypso_sites_dashboard_site_action_jetpack_support_click' );
				},
				isEligible: isActionEligible( 'jetpack-support', capabilities ),
			},
			{
				id: 'migrate-to-wpcom',
				label: __( 'Migrate to WordPress.com' ),
				callback: () => {
					page( localizeUrl( 'https://wordpress.com/move' ) );
					recordTracksEvent( 'calypso_sites_dashboard_site_action_migrate_to_wpcom_click' );
				},
				isEligible: isActionEligible( 'migrate-to-wpcom', capabilities ),
			},

			{
				id: 'leave-site',
				label: __( 'Leave site' ),
				callback: () => {
					recordTracksEvent( 'calypso_sites_dashboard_site_action_leave_site_click' );
				},
				isEligible: isActionEligible( 'leave-site', capabilities ),
				RenderModal: ( { items, closeModal }: RenderModalProps< SiteExcerptData > ) => {
					return (
						<AsyncLoad
							require="calypso/sites/settings/administration/tools/leave-site/leave-site-modal-form"
							placeholder={ null }
							siteId={ items[ 0 ]?.ID ?? 0 }
							onSuccess={ () => {
								queryClient.invalidateQueries( {
									queryKey: [
										USE_SITE_EXCERPTS_QUERY_KEY,
										SITE_EXCERPT_REQUEST_FIELDS,
										SITE_EXCERPT_REQUEST_OPTIONS,
										[],
										'all',
									],
								} );
							} }
							onClose={ closeModal }
						/>
					);
				},
				modalSize: 'small',
				hideModalHeader: true,
			},

			{
				id: 'delete-site',
				label: __( 'Delete site' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					let urlPath;

					if ( isStagingSite( site ) ) {
						urlPath = `/staging-site/${ site.slug }`;
					} else {
						urlPath = `/sites/settings/site/${ site.slug }/delete-site`;
					}

					page( urlPath );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_delete_click' ) );
				},
				isEligible: isActionEligible( 'delete-site', capabilities ),
			},
		],
		[
			__,
			capabilities,
			dispatch,
			openSitePreviewPane,
			restoreSite,
			viewType,
			localizeUrl,
			queryClient,
		]
	);
}
