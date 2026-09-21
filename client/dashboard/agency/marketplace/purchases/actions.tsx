import { jetpackAgencyLicenseDownloadUrlMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { a4aLink, wpcomLink } from '../../../utils/link';
import { urlToSlug } from '../../../utils/url';
import { getMarketplaceHostingSectionRoute } from '../paths';
import AssignLicenseModal from './assign-license-modal';
import {
	getLicenseProductName,
	getLicenseStatus,
	isAutoRenewDisabled,
	isBundleParent,
	isChildLicense,
	isJetpackCrmLicense,
	isPartnerLicense,
	isPressableAddonLicense,
	isPressableLicense,
	isWpcomHostingLicense,
} from './license-status';
import RevokeLicenseModal from './revoke-license-modal';
import SiteConfigurationModal from './site-configuration-modal';
import type { JetpackLicense } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

export function getLicenseActions( {
	canRevoke,
	isAgencyOwner,
	isProvisioning,
	onCopyKey,
	onDownload,
	onOpenHosting,
	recordTracksEvent,
}: {
	canRevoke: boolean;
	// A site is already being created. Holding the rest back is a UI convention
	// carried over from the classic dashboard, not something the API enforces.
	isProvisioning: boolean;
	isAgencyOwner: boolean;
	onCopyKey: ( license: JetpackLicense ) => void;
	onDownload: ( license: JetpackLicense ) => void;
	onOpenHosting: ( license: JetpackLicense ) => void;
	recordTracksEvent: ( eventName: string ) => void;
} ): Action< JetpackLicense >[] {
	// Only the agency owner can act on Pressable licenses.
	const canAct = ( item: JetpackLicense ) => isAgencyOwner || ! isPressableLicense( item );
	const isAssignable = ( item: JetpackLicense ) =>
		canAct( item ) &&
		isPartnerLicense( item ) &&
		getLicenseStatus( item ) === 'unassigned' &&
		! isBundleParent( item ) &&
		! isPressableAddonLicense( item );
	const isAssigned = ( item: JetpackLicense ) =>
		canAct( item ) && getLicenseStatus( item ) === 'assigned' && !! item.siteurl;
	// Site management actions only apply to sites created from a WordPress.com hosting license.
	const isAssignedWpcomSite = ( item: JetpackLicense ) =>
		isAssigned( item ) && isWpcomHostingLicense( item );
	const isDevSite = ( item: JetpackLicense ) => item.meta?.a4a_is_dev_site === '1';
	const openExternal = ( url: string ) => window.open( url, '_blank', 'noopener,noreferrer' );

	const openSitePage = ( item: JetpackLicense, getPath: ( siteSlug: string ) => string ) =>
		openExternal( wpcomLink( getPath( urlToSlug( item.siteurl ?? '' ) ) ) );

	// The site actions open the same WordPress.com pages as the classic license row.
	// TODO: point each at its own screen once site details and settings land in
	// MSD (A4A-3021).
	return [
		{
			id: 'set-up-site',
			label: __( 'Set up site' ),
			isEligible: isAssignedWpcomSite,
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_site_set_up_click' );
				openSitePage( items[ 0 ], ( siteSlug ) => `/overview/${ siteSlug }` );
			},
		},
		{
			id: 'change-domain',
			label: __( 'Change domain' ),
			isEligible: ( item ) => isAssignedWpcomSite( item ) && ! isDevSite( item ),
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_change_domain_click' );
				openSitePage( items[ 0 ], ( siteSlug ) => `/domains/manage/${ siteSlug }` );
			},
		},
		{
			id: 'hosting-configuration',
			label: __( 'Hosting configuration' ),
			isEligible: isAssignedWpcomSite,
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_hosting_configuration_click' );
				openSitePage( items[ 0 ], ( siteSlug ) => `/sites/${ siteSlug }/settings` );
			},
		},
		{
			id: 'edit-site-in-wp-admin',
			label: __( 'Edit site in WP Admin' ),
			isEligible: isAssignedWpcomSite,
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_edit_site_click' );
				openExternal( `${ items[ 0 ].siteurl }/wp-admin/admin.php?page=jetpack#/dashboard` );
			},
		},
		{
			id: 'debug-site',
			label: __( 'Debug site' ),
			isEligible: ( item ) => isAssigned( item ) && ! isPressableLicense( item ),
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_debug_site_click' );
				openExternal( `https://jptools.wordpress.com/debug/?url=${ items[ 0 ].siteurl }` );
			},
		},
		{
			id: 'upgrade',
			label: __( 'Upgrade' ),
			isEligible: ( item ) =>
				canAct( item ) &&
				( isWpcomHostingLicense( item ) || isPressableLicense( item ) ) &&
				! isPressableAddonLicense( item ) &&
				getLicenseStatus( item ) !== 'revoked' &&
				! isDevSite( item ) &&
				! item.referral &&
				! isAutoRenewDisabled( item ),
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_upgrade_click' );
				onOpenHosting( items[ 0 ] );
			},
		},
		{
			id: 'prepare-for-launch',
			label: __( 'Prepare for launch' ),
			// TODO: classic checks WP Admin access first and shows a permission modal
			// when the user cannot launch the site.
			isEligible: ( item ) => isAssignedWpcomSite( item ) && isDevSite( item ),
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_prepare_for_launch_click' );
				openSitePage( items[ 0 ], ( siteSlug ) => `/sites/${ siteSlug }/settings/site-visibility` );
			},
		},
		{
			id: 'create-site',
			label: __( 'Create site' ),
			isEligible: ( item ) => isAssignable( item ) && isWpcomHostingLicense( item ),
			disabled: isProvisioning,
			modalHeader: __( 'Configure your new site' ),
			modalSize: 'medium',
			RenderModal: ( { items, closeModal } ) => (
				<SiteConfigurationModal license={ items[ 0 ] } closeModal={ closeModal } />
			),
		},
		{
			id: 'assign-license',
			label: __( 'Assign to site' ),
			isEligible: ( item ) => isAssignable( item ) && ! isWpcomHostingLicense( item ),
			modalHeader: __( 'Which site would you like to assign this license to?' ),
			modalSize: 'medium',
			RenderModal: ( { items, closeModal } ) => (
				<AssignLicenseModal license={ items[ 0 ] } closeModal={ closeModal } />
			),
		},
		{
			id: 'copy-license-key',
			label: __( 'Copy license key' ),
			// Classic never exposes the key of a Pressable license.
			isEligible: ( item ) => canAct( item ) && ! isPressableLicense( item ),
			callback: ( items ) => onCopyKey( items[ 0 ] ),
		},
		{
			id: 'download-license-product',
			label: __( 'Download product' ),
			isEligible: ( item ) =>
				canAct( item ) &&
				isPartnerLicense( item ) &&
				item.has_downloads &&
				getLicenseStatus( item ) !== 'revoked',
			callback: ( items ) => onDownload( items[ 0 ] ),
		},
		{
			id: 'download-crm-extensions',
			label: __( 'Download Jetpack CRM Extensions' ),
			isEligible: ( item ) =>
				canAct( item ) && isJetpackCrmLicense( item ) && getLicenseStatus( item ) === 'assigned',
			// The CRM downloads page still lives in the classic dashboard.
			callback: ( items ) =>
				window.location.assign( a4aLink( `/purchases/crm-downloads/${ items[ 0 ].license_key }` ) ),
		},
		{
			id: 'revoke-license',
			label: __( 'Revoke license' ),
			// Referral licenses are paid for by the client, so the agency cannot revoke them.
			isEligible: ( item ) => {
				if ( ! canAct( item ) || ! canRevoke ) {
					return false;
				}
				// Classic gates a bundle on the capability alone.
				if ( isBundleParent( item ) ) {
					return getLicenseStatus( item ) !== 'revoked';
				}
				return (
					isPartnerLicense( item ) &&
					! item.referral &&
					! isAutoRenewDisabled( item ) &&
					( isChildLicense( item )
						? getLicenseStatus( item ) === 'assigned'
						: getLicenseStatus( item ) !== 'revoked' )
				);
			},
			modalHeader: ( items ) =>
				isBundleParent( items[ 0 ] )
					? sprintf(
							/* translators: %1$d is the number of licenses in the bundle, %2$s is the product name. */
							__( 'Revoke bundle of %1$d %2$s licenses?' ),
							items[ 0 ].quantity ?? 0,
							getLicenseProductName( items[ 0 ] )
						)
					: sprintf(
							/* translators: %s is the product name. */
							__( 'Revoke %s license?' ),
							getLicenseProductName( items[ 0 ] )
						),
			RenderModal: ( { items, closeModal } ) => (
				<RevokeLicenseModal license={ items[ 0 ] } closeModal={ closeModal } />
			),
		},
	];
}

export function useLicenseActions( {
	agencyId,
	canRevoke,
	isAgencyOwner,
	isProvisioning,
}: {
	agencyId: number;
	canRevoke: boolean;
	isAgencyOwner: boolean;
	isProvisioning: boolean;
} ): Action< JetpackLicense >[] {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: fetchDownloadUrl } = useMutation(
		jetpackAgencyLicenseDownloadUrlMutation( agencyId )
	);

	const onCopyKey = useCallback(
		( license: JetpackLicense ) => {
			recordTracksEvent( 'calypso_a4a_license_list_copy_license_click' );
			navigator.clipboard.writeText( license.license_key ).then(
				() => createSuccessNotice( __( 'License key copied to clipboard.' ), { type: 'snackbar' } ),
				() => createErrorNotice( __( 'Failed to copy the license key.' ), { type: 'snackbar' } )
			);
		},
		[ recordTracksEvent, createSuccessNotice, createErrorNotice ]
	);

	const onDownload = useCallback(
		( license: JetpackLicense ) => {
			recordTracksEvent( 'calypso_a4a_license_details_download' );
			fetchDownloadUrl( license.license_key, {
				onSuccess: ( { download_url } ) => window.location.assign( download_url ),
				onError: ( error: Error ) =>
					createErrorNotice(
						error.message || __( 'Failed to download the product. Please try again.' ),
						{ type: 'snackbar' }
					),
			} );
		},
		[ recordTracksEvent, fetchDownloadUrl, createErrorNotice ]
	);

	// Classic sends each hosting license to its own host's page.
	const onOpenHosting = useCallback(
		( license: JetpackLicense ) =>
			navigate( {
				to: getMarketplaceHostingSectionRoute(
					isPressableLicense( license ) ? 'pressable' : 'wpcom'
				),
			} ),
		[ navigate ]
	);

	return useMemo(
		() =>
			getLicenseActions( {
				canRevoke,
				isAgencyOwner,
				isProvisioning,
				onCopyKey,
				onDownload,
				onOpenHosting,
				recordTracksEvent,
			} ),
		[
			canRevoke,
			isAgencyOwner,
			isProvisioning,
			onCopyKey,
			onDownload,
			onOpenHosting,
			recordTracksEvent,
		]
	);
}
