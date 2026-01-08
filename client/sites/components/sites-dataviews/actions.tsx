import page from '@automattic/calypso-router';
import {
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
	SiteExcerptData,
} from '@automattic/sites';
import { useQueryClient } from '@tanstack/react-query';
import { backup, external, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import {
	isCustomDomain,
	isDisconnectedJetpackAndNotAtomic,
	isNotAtomicJetpack,
	isP2Site,
	isSitePreviewPaneEligible,
} from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Action, RenderModalProps } from '@wordpress/dataviews';

type Capabilities = Record< string, Record< string, boolean > >;

// Export this function for testing purposes.
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
		case 'admin':
			return ( site: SiteExcerptData ) => {
				if ( site.is_deleted ) {
					return false;
				}
				return true;
			};
		case 'site':
			return ( site: SiteExcerptData ) => {
				if ( site.is_deleted ) {
					return false;
				}
				return true;
			};
		case 'domains':
			return ( site: SiteExcerptData ) => {
				if ( ! canOpenHosting( site ) ) {
					return false;
				}

				const hasCustomDomain = isCustomDomain( site.slug );
				return hasCustomDomain;
			};
		case 'jetpack-cloud':
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

// The actions should align with client/dashboard/sites/dataviews/actions.tsx.
export function useActions( {
	viewType,
}: {
	viewType: 'list' | 'table' | 'grid' | 'pickerGrid' | 'pickerTable';
} ): Action< SiteExcerptData >[] {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

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
			{
				id: 'admin',
				isPrimary: viewType !== 'list',
				label: __( 'WP Admin ↗' ),
				icon: wordpress,
				callback: ( sites ) => {
					const site = sites[ 0 ];
					if ( site.options?.admin_url ) {
						window.open( site.options?.admin_url, '_blank' );
					}
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_wpadmin_click' ) );
				},
				isEligible: isActionEligible( 'admin', capabilities ),
			},
			{
				id: 'site',
				isPrimary: viewType !== 'list',
				label: __( 'Visit site ↗' ),
				icon: external,
				callback: ( sites ) => {
					const site = sites[ 0 ];
					const siteUrl = window.open( site.URL, '_blank' );
					if ( siteUrl ) {
						siteUrl.opener = null;
						siteUrl.focus();
					}
				},
				isEligible: isActionEligible( 'site', capabilities ),
			},
			{
				id: 'domains',
				label: __( 'Domains ↗' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.open( `/domains/manage/${ site.slug }`, '_blank' );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_domains_and_dns_click' )
					);
				},
				isEligible: isActionEligible( 'domains', capabilities ),
			},
			{
				id: 'jetpack-cloud',
				label: __( 'Jetpack Cloud ↗' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					window.open( `https://cloud.jetpack.com/landing/${ site.slug }`, '_blank' );
					recordTracksEvent( 'calypso_sites_dashboard_site_action_jetpack_cloud_click' );
				},
				isEligible: isActionEligible( 'jetpack-cloud', capabilities ),
			},
			// https://github.com/Automattic/wp-calypso/pull/93737
			{
				id: 'prepare-for-launch',
				label: __( 'Prepare for launch' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					page( `/sites/${ site.slug }/settings/site-visibility` );
					dispatch(
						recordTracksEvent( 'calypso_sites_dashboard_site_action_prepare_for_launch_click' )
					);
				},
				isEligible: isActionEligible( 'prepare-for-launch', capabilities ),
			},
			{
				id: 'settings',
				label: __( 'Settings' ),
				callback: ( sites ) => {
					const site = sites[ 0 ];
					page( `/sites/${ site.slug }/settings` );
					dispatch( recordTracksEvent( 'calypso_sites_dashboard_site_action_settings_click' ) );
				},
				isEligible: isActionEligible( 'settings', capabilities ),
			},
			{
				id: 'restore',
				isPrimary: true,
				icon: backup,
				label: __( 'Restore site' ),
				callback: () => {
					recordTracksEvent( 'calypso_sites_dashboard_site_action_restore_site_click' );
				},
				isEligible: isActionEligible( 'restore', capabilities ),
				RenderModal: ( { items, closeModal }: RenderModalProps< SiteExcerptData > ) => {
					return (
						<AsyncLoad
							require="calypso/sites/settings/administration/tools/restore-site/restore-site-form"
							placeholder={ null }
							siteId={ items[ 0 ]?.ID ?? 0 }
							onClose={ closeModal }
						/>
					);
				},
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
			},
		],
		[ __, capabilities, dispatch, viewType, queryClient ]
	);
}
