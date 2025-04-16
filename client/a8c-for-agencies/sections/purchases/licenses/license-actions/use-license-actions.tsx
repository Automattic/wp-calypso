import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import CancelLicenseFeedbackModal from 'calypso/a8c-for-agencies/components/a4a-feedback/churn-mechanism/cancel-license-feedback-modal';
import {
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_SITES_LINK_NEEDS_SETUP,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	isPressableHostingProduct,
	isWPCOMHostingProduct,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import getLicenseState from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-license-state';
import {
	LicenseState,
	LicenseAction,
	LicenseType,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { License } from 'calypso/state/partner-portal/types';
import RevokeLicenseDialog from '../revoke-license-dialog';
import useLicenseDownloadUrlMutation from '../revoke-license-dialog/hooks/use-license-download-url-mutation';

export type LicenseActionType = 'bundle' | 'wpcom' | 'regular';

type Props = {
	license: License;
	isDevSite: boolean;
	licenseType: LicenseType;
	isChildLicense?: boolean;
	isClientLicense?: boolean;
	type: LicenseActionType;
	licenseKey: string;
	productName: string;
	productId: number;
	bundleSize: number;
};

export default function useLicenseActions( {
	license,
	isDevSite,
	licenseType,
	isChildLicense,
	isClientLicense,
	type,
	productName,
	bundleSize,
}: Props ): LicenseAction[] {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const canRevoke = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_revoke_licenses' )
	);

	const isPressableLicense = isPressableHostingProduct( license.licenseKey );
	const isWPCOMHostingLicense = isWPCOMHostingProduct( license.licenseKey );

	const { mutate: downloadLicense } = useLicenseDownloadUrlMutation( license.licenseKey );

	return useMemo( () => {
		const licenseState = getLicenseState( license.attachedAt, license.revokedAt );

		if ( licenseState === LicenseState.Revoked ) {
			return [];
		}

		const siteSlug = license.siteUrl ? urlToSlug( license.siteUrl ) : null;

		const handleClickMenuItem = ( eventName: string ) => {
			dispatch( recordTracksEvent( eventName ) );
		};

		return [
			{
				name: translate( 'Prepare for launch' ),
				href: `https://wordpress.com/sites/settings/site/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'prepare_for_launch' ),
				isExternalLink: true,
				isEnabled: type === 'wpcom' && isDevSite,
			},

			{
				name: translate( 'Set up site' ),
				href: `https://wordpress.com/overview/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_site_set_up_click' ),
				isExternalLink: true,
				isEnabled: type === 'wpcom',
			},

			{
				name: translate( 'Change domain' ),
				href: `https://wordpress.com/domains/manage/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_change_domain_click' ),
				isExternalLink: true,
				isEnabled: type === 'wpcom',
			},

			{
				name: translate( 'Hosting configuration' ),
				href: `https://wordpress.com/hosting-config/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_hosting_configuration_click' ),
				isExternalLink: true,
				isEnabled: type === 'wpcom',
			},

			{
				name: translate( 'Edit site in WP Admin' ),
				href: `${ license.siteUrl }/wp-admin/admin.php?page=jetpack#/dashboard`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_edit_site_click' ),
				isExternalLink: true,
				isEnabled: type === 'wpcom',
			},

			{
				name: translate( 'Download' ),
				onClick: () => {
					handleClickMenuItem( 'calypso_a4a_licenses_download_click' );
					downloadLicense( null, {
						onSuccess: ( data ) => {
							window.location.replace( data.download_url );
						},
						onError: ( error ) => {
							dispatch( errorNotice( error.message ) );
						},
					} );
				},
				isExternalLink: false,
				isEnabled:
					type === 'regular' &&
					license.hasDownloads &&
					licenseState === LicenseState.Attached &&
					licenseType === LicenseType.Partner,
			},

			{
				name: translate( 'View site' ),
				href: license.siteUrl ?? '',
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_view_site_click' ),
				isExternalLink: true,
				isEnabled:
					type === 'regular' && licenseState === LicenseState.Attached && ! isPressableLicense,
			},

			{
				name: translate( 'Debug site' ),
				href: `https://jptools.wordpress.com/debug/?url=${ license.siteUrl }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_debug_site_click' ),
				isExternalLink: true,
				isEnabled:
					[ 'wpcom', 'regular' ].includes( type ) &&
					licenseState === LicenseState.Attached &&
					! isPressableLicense,
			},

			{
				name: translate( 'Manage in Pressable' ),
				href: 'https://my.pressable.com/agency/auth',
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_manage_in_pressable_click' ),
				isExternalLink: true,
				isEnabled:
					type === 'regular' && licenseState === LicenseState.Attached && isPressableLicense,
			},

			{
				name: translate( 'Upgrade' ),
				href: isPressableLicense
					? A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK
					: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_upgrade_click' ),
				isExternalLink: false,
				isEnabled:
					[ 'wpcom', 'regular' ].includes( type ) &&
					! isClientLicense &&
					! isDevSite &&
					( isPressableLicense || isWPCOMHostingLicense ),
			},

			{
				name: translate( 'Revoke' ),
				href:
					type === 'wpcom'
						? `https://wordpress.com/purchases/subscriptions/${ siteSlug }`
						: undefined,
				isExternalLink: type === 'wpcom',
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_revoke_click' ),
				type: 'revoke',
				isEnabled:
					[ 'wpcom', 'regular' ].includes( type ) &&
					canRevoke &&
					( isChildLicense ? licenseState === LicenseState.Attached : true ) &&
					licenseType === LicenseType.Partner,
				className: 'is-destructive',
				dialog:
					type === 'regular'
						? ( { onClose } ) => (
								<RevokeLicenseDialog
									licenseRole={ isChildLicense ? LicenseRole.Child : LicenseRole.Single }
									licenseKey={ license.licenseKey }
									product={ productName }
									siteUrl={ license.siteUrl }
									onClose={ onClose }
								/>
						  )
						: undefined,
			},

			// This is for Bundle licenses
			{
				name: translate( 'Revoke bundle' ),
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_revoke_bundle_clicked' ),
				isEnabled: type === 'bundle' && canRevoke,
				className: 'is-destructive',
				dialog: ( { onClose } ) => (
					<CancelLicenseFeedbackModal
						onClose={ onClose }
						productName={ productName }
						licenseKey={ license.licenseKey }
						productId={ license.productId }
						bundleSize={ bundleSize }
						isClientLicense={ isClientLicense }
					/>
				),
			},

			{
				name: isWPCOMHostingLicense ? translate( 'Create site' ) : translate( 'Assign license' ),
				href: isWPCOMHostingLicense
					? A4A_SITES_LINK_NEEDS_SETUP
					: addQueryArgs( { key: license.licenseKey }, A4A_MARKETPLACE_ASSIGN_LICENSE_LINK ),
				onClick: () =>
					handleClickMenuItem(
						isWPCOMHostingLicense
							? 'calypso_a4a_licenses_create_site_click'
							: 'calypso_a4a_licenses_assign_license_click'
					),
				isExternalLink: false,
				isEnabled: type === 'wpcom' && ! isClientLicense && ! isDevSite,
			},
			{
				name: translate( 'Revoke' ),
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_hosting_configuration_click' ),
				type: 'revoke',
				isEnabled:
					type === 'regular' &&
					licenseState === LicenseState.Detached &&
					licenseType === LicenseType.Partner,
			},
		];
	}, [
		bundleSize,
		canRevoke,
		dispatch,
		downloadLicense,
		isChildLicense,
		isClientLicense,
		isDevSite,
		isPressableLicense,
		isWPCOMHostingLicense,
		license.attachedAt,
		license.hasDownloads,
		license.licenseKey,
		license.productId,
		license.revokedAt,
		license.siteUrl,
		licenseType,
		productName,
		translate,
		type,
	] );
}
