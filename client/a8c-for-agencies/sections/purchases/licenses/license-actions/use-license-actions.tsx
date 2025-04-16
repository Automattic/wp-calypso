import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import CancelLicenseFeedbackModal from 'calypso/a8c-for-agencies/components/a4a-feedback/churn-mechanism/cancel-license-feedback-modal';
import { A4A_MARKETPLACE_HOSTING_WPCOM_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import getLicenseState from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-license-state';
import {
	LicenseState,
	LicenseAction,
	LicenseType,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { License } from 'calypso/state/partner-portal/types';

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

			// This are menu items for Assigned WPCOM Licenses
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
				name: translate( 'Debug site' ),
				href: `https://jptools.wordpress.com/debug/?url=${ license.siteUrl }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_debug_site_click' ),
				isExternalLink: true,
				isEnabled: type === 'wpcom' && licenseState === LicenseState.Attached,
			},
			{
				name: translate( 'Upgrade' ),
				href: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_upgrade_click' ),
				isExternalLink: false,
				isEnabled: type === 'wpcom' && ! isClientLicense && ! isDevSite,
			},
			{
				name: translate( 'Revoke' ),
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_hosting_configuration_click' ),
				type: 'revoke',
				isEnabled:
					type === 'wpcom' &&
					canRevoke &&
					( isChildLicense ? licenseState === LicenseState.Attached : true ) &&
					licenseType === LicenseType.Partner,
				className: 'is-destructive',
			},
		];
	}, [
		bundleSize,
		canRevoke,
		dispatch,
		isChildLicense,
		isClientLicense,
		isDevSite,
		license.attachedAt,
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
