import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { external, trash } from '@wordpress/icons';
import { lazy, Suspense, useCallback, useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import {
	agencySiteActivityRoute,
	agencySiteBackupsRoute,
	agencySiteSettingsRoute,
	agencySiteSettingsSiteVisibilityRoute,
	marketplaceRoute,
} from '../../../app/router/agency';
import { wpcomLink } from '../../../utils/link';
import { urlToSlug } from '../../../utils/url';
import {
	canActOnSite,
	getAdminUrl,
	getSiteUrl,
	isAtomicSite,
	isDevSite,
	isUrlOnlySite,
} from './site-data';
import type { AnalyticsClient } from '../../../app/analytics';
import type { AgencySite } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

const RemoveSiteModal = lazy( () => import( '../remove-site-modal' ) );

export function getAgencyActions( {
	canIssueLicenses,
	canRemoveSites,
	onIssueLicense,
	onOpenSettings,
	onPrepareForLaunch,
	onViewActivity,
	onViewBackups,
	recordTracksEvent,
}: {
	canIssueLicenses: boolean;
	canRemoveSites: boolean;
	onIssueLicense: () => void;
	onOpenSettings: ( site: AgencySite ) => void;
	onPrepareForLaunch: ( site: AgencySite ) => void;
	onViewActivity: ( site: AgencySite ) => void;
	onViewBackups: ( site: AgencySite ) => void;
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ];
} ): Action< AgencySite >[] {
	const track = ( action: string ) =>
		recordTracksEvent( 'calypso_dashboard_sites_action_click', { action } );

	const openWpcom = ( action: string, path: string ) => {
		track( action );
		window.open( wpcomLink( path ), '_blank' );
	};

	// Actions that reach the site or its profile are unavailable while a site is
	// migrating, unreachable, or not managed through the agency dashboard.
	const isManageable = ( site: AgencySite ) => canActOnSite( site ) && ! isUrlOnlySite( site );
	const isManageableAtomic = ( site: AgencySite ) => isManageable( site ) && isAtomicSite( site );

	return [
		{
			id: 'admin',
			isPrimary: true,
			icon: external,
			label: __( 'WP Admin ↗' ),
			callback: ( sites: AgencySite[] ) => {
				const site = sites[ 0 ];
				track( 'admin' );
				if ( site ) {
					window.open( getAdminUrl( site ), '_blank' );
				}
			},
			isEligible: isManageable,
		},
		{
			id: 'site',
			icon: external,
			label: __( 'Visit site ↗' ),
			callback: ( sites: AgencySite[] ) => {
				const site = sites[ 0 ];
				track( 'site' );
				if ( site ) {
					window.open( getSiteUrl( site ), '_blank' );
				}
			},
		},
		{
			id: 'prepare-for-launch',
			label: __( 'Prepare for launch' ),
			callback: ( sites: AgencySite[] ) => {
				track( 'prepare-for-launch' );
				onPrepareForLaunch( sites[ 0 ] );
			},
			isEligible: ( site: AgencySite ) => canActOnSite( site ) && isDevSite( site ),
		},
		{
			id: 'set-up-site',
			icon: external,
			label: __( 'Set up site' ),
			callback: ( sites: AgencySite[] ) =>
				openWpcom( 'set-up-site', `/overview/${ sites[ 0 ].blog_id }` ),
			isEligible: isManageableAtomic,
		},
		{
			id: 'change-domain',
			icon: external,
			label: __( 'Change domain' ),
			callback: ( sites: AgencySite[] ) =>
				openWpcom( 'change-domain', `/domains/manage/${ sites[ 0 ].blog_id }` ),
			isEligible: ( site: AgencySite ) => isManageableAtomic( site ) && ! isDevSite( site ),
		},
		{
			// Classic splits this into "Hosting configuration" and "Site settings",
			// which both land on the one settings screen here.
			id: 'settings',
			label: __( 'Settings' ),
			callback: ( sites: AgencySite[] ) => {
				track( 'settings' );
				onOpenSettings( sites[ 0 ] );
			},
			isEligible: isManageableAtomic,
		},
		{
			id: 'issue-license',
			label: __( 'Issue new license' ),
			callback: () => {
				track( 'issue-license' );
				onIssueLicense();
			},
			isEligible: ( site: AgencySite ) =>
				canIssueLicenses && isManageable( site ) && ! isAtomicSite( site ),
		},
		{
			id: 'view-activity',
			label: __( 'View activity' ),
			callback: ( sites: AgencySite[] ) => {
				track( 'view-activity' );
				onViewActivity( sites[ 0 ] );
			},
			isEligible: isManageable,
		},
		{
			// Atomic sites clone through the WordPress.com backup flow, which the
			// agency dashboard has no equivalent of.
			id: 'clone-site',
			icon: external,
			label: __( 'Copy this site' ),
			callback: ( sites: AgencySite[] ) =>
				openWpcom( 'clone-site', `/backup/${ urlToSlug( sites[ 0 ].url ) }/clone` ),
			isEligible: ( site: AgencySite ) => isManageableAtomic( site ) && !! site.has_backup,
		},
		{
			id: 'clone-site-backups',
			label: __( 'Copy this site' ),
			callback: ( sites: AgencySite[] ) => {
				track( 'clone-site' );
				onViewBackups( sites[ 0 ] );
			},
			isEligible: ( site: AgencySite ) =>
				isManageable( site ) && ! isAtomicSite( site ) && !! site.has_backup,
		},
		{
			id: 'remove-site',
			icon: trash,
			label: __( 'Remove site' ),
			modalHeader: __( 'Remove site' ),
			isEligible: ( site: AgencySite ) =>
				canRemoveSites && canActOnSite( site ) && ! isDevSite( site ),
			RenderModal: ( { items, closeModal } ) => (
				<Suspense fallback={ null }>
					<RemoveSiteModal site={ items[ 0 ] } closeModal={ closeModal } />
				</Suspense>
			),
		},
	];
}

export function useAgencyActions( {
	canIssueLicenses,
	canRemoveSites,
}: {
	canIssueLicenses: boolean;
	canRemoveSites: boolean;
} ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	const onIssueLicense = useCallback(
		() => navigate( { to: marketplaceRoute.fullPath } ),
		[ navigate ]
	);

	const onOpenSettings = useCallback(
		( site: AgencySite ) =>
			navigate( { to: agencySiteSettingsRoute.fullPath, params: { siteSlug: site.url } } ),
		[ navigate ]
	);

	const onPrepareForLaunch = useCallback(
		( site: AgencySite ) =>
			navigate( {
				to: agencySiteSettingsSiteVisibilityRoute.fullPath,
				params: { siteSlug: site.url },
			} ),
		[ navigate ]
	);

	const onViewActivity = useCallback(
		( site: AgencySite ) =>
			navigate( { to: agencySiteActivityRoute.fullPath, params: { siteSlug: site.url } } ),
		[ navigate ]
	);

	const onViewBackups = useCallback(
		( site: AgencySite ) =>
			navigate( { to: agencySiteBackupsRoute.fullPath, params: { siteSlug: site.url } } ),
		[ navigate ]
	);

	return useMemo(
		() =>
			getAgencyActions( {
				canIssueLicenses,
				canRemoveSites,
				onIssueLicense,
				onOpenSettings,
				onPrepareForLaunch,
				onViewActivity,
				onViewBackups,
				recordTracksEvent,
			} ),
		[
			canIssueLicenses,
			canRemoveSites,
			onIssueLicense,
			onOpenSettings,
			onPrepareForLaunch,
			onViewActivity,
			onViewBackups,
			recordTracksEvent,
		]
	);
}
