import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, wordpress } from '@wordpress/icons';
import { lazy, Suspense } from 'react';
import { useAnalytics } from '../../app/analytics';
import { siteDomainsRoute } from '../../app/router/sites';
import ComponentViewTracker from '../../components/component-view-tracker';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { getSiteBlockingStatus } from '../../utils/site-status';
import { siteTypeSupportsFeature } from '../../utils/site-type-feature-support';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { canManageSite, canDisconnectSite, canLeaveSite, canRestoreSite } from '../features';
import type { Site } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

const JetpackSiteDisconnect = lazy( () => import( '../jetpack-site-disconnect' ) );
const SiteLeaveContentInfo = lazy( () => import( '../site-leave-modal/content-info' ) );
const SiteRestoreContentInfo = lazy( () => import( '../site-restore-modal/content-info' ) );

const noop = () => undefined;

export function useActions(): Action< Site >[] {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();

	// Some actions are not available if the site has migration, deleted, or DIFM status
	const hasBlockingStatus = ( site: Site ) => !! getSiteBlockingStatus( site );

	return [
		{
			id: 'admin',
			isPrimary: true,
			icon: <Icon icon={ wordpress } />,
			label: __( 'WP Admin ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'admin' } );
				if ( site.options?.admin_url ) {
					window.open( site.options.admin_url, '_blank' );
				}
			},
			isEligible: ( item: Site ) => ( item.is_deleted || ! item.options?.admin_url ? false : true ),
		},
		{
			id: 'site',
			label: __( 'Visit site ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'site' } );
				if ( site.URL ) {
					window.open( site.URL, '_blank' );
				}
			},
			isEligible: ( item: Site ) => ( item.is_deleted || ! item.URL ? false : true ),
		},
		{
			id: 'domains',
			label: isDashboardBackport() ? __( 'Domains ↗' ) : __( 'Domains' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'domains' } );
				if ( isDashboardBackport() ) {
					window.open( `/domains/manage/${ site.slug }`, '_blank' );
					return;
				}

				router.navigate( { to: siteDomainsRoute.fullPath, params: { siteSlug: site.slug } } );
			},
			isEligible: ( item: Site ) =>
				siteTypeSupportsFeature( item, 'domains' ) &&
				canManageSite( item ) &&
				! hasBlockingStatus( item ),
		},
		{
			id: 'jetpack-cloud',
			label: __( 'Jetpack Cloud ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'jetpack-cloud' } );
				window.open( `https://cloud.jetpack.com/landing/${ site.slug }` );
			},
			isEligible: ( item: Site ) => isSelfHostedJetpackConnected( item ),
		},
		{
			id: 'prepare-for-launch',
			label: __( 'Prepare for launch' ),
			callback: ( sites ) => {
				const site = sites[ 0 ];
				router.navigate( {
					to: '/sites/$siteSlug/settings/site-visibility',
					params: { siteSlug: site.slug },
				} );

				recordTracksEvent( 'calypso_dashboard_sites_action_click', {
					action: 'prepare-for-launch',
				} );
				// Legacy event, kept for continuity with existing dashboards/queries. Now
				// redundant with the unified action_click event above; remove once teams
				// relying on it have migrated. See PR discussion.
				recordTracksEvent( 'calypso_sites_dashboard_site_action_prepare_for_launch_click' );
			},
			isEligible: ( item: Site ) =>
				canManageSite( item ) &&
				! hasBlockingStatus( item ) &&
				! item.is_wpcom_staging_site &&
				item.launch_status === 'unlaunched',
		},
		{
			id: 'settings',
			label: __( 'Settings' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				recordTracksEvent( 'calypso_dashboard_sites_action_click', { action: 'settings' } );
				router.navigate( { to: '/sites/$siteSlug/settings', params: { siteSlug: site.slug } } );
			},
			isEligible: ( item: Site ) =>
				siteTypeSupportsFeature( item, 'settings' ) &&
				canManageSite( item ) &&
				! hasBlockingStatus( item ),
		},
		{
			id: 'restore',
			// Intentionally not `isPrimary`. For deleted sites, restore is the only
			// eligible action, and the DataViews bug below hides primary actions behind
			// hover with no kebab fallback, making restore undiscoverable.
			// https://github.com/WordPress/gutenberg/issues/78842
			icon: backup,
			label: __( 'Restore site' ),
			isEligible: ( item: Site ) => canRestoreSite( item ),
			RenderModal: ( { items, closeModal } ) => (
				<Suspense fallback={ null }>
					<ComponentViewTracker
						eventName="calypso_dashboard_sites_action_click"
						properties={ { action: 'restore' } }
					/>
					<SiteRestoreContentInfo site={ items[ 0 ] } onClose={ closeModal ?? noop } />
				</Suspense>
			),
		},
		{
			id: 'disconnect',
			label: __( 'Disconnect site' ),
			isEligible: ( item: Site ) => canDisconnectSite( item ),
			RenderModal: ( { items, closeModal } ) => (
				<Suspense fallback={ null }>
					<ComponentViewTracker
						eventName="calypso_dashboard_sites_action_click"
						properties={ { action: 'disconnect' } }
					/>
					<JetpackSiteDisconnect site={ items[ 0 ] } onClose={ closeModal ?? noop } />
				</Suspense>
			),
		},
		{
			id: 'leave',
			label: __( 'Leave site' ),
			isEligible: ( item: Site ) => canLeaveSite( item ),
			RenderModal: ( { items, closeModal } ) => (
				<Suspense fallback={ null }>
					<ComponentViewTracker
						eventName="calypso_dashboard_sites_action_click"
						properties={ { action: 'leave' } }
					/>
					<SiteLeaveContentInfo site={ items[ 0 ] } onClose={ closeModal ?? noop } />
				</Suspense>
			),
		},
	];
}
