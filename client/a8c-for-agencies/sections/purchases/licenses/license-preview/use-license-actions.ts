import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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

export default function useLicenseActions(
	siteUrl: string | null,
	isDevSite: boolean,
	attachedAt: string | null,
	revokedAt: string | null,
	licenseType: LicenseType,
	isChildLicense?: boolean,
	isClientLicense?: boolean
): LicenseAction[] {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const canRevoke = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_revoke_licenses' )
	);

	return useMemo( () => {
		if ( ! siteUrl ) {
			return [];
		}

		const siteSlug = urlToSlug( siteUrl );

		const handleClickMenuItem = ( eventName: string ) => {
			dispatch( recordTracksEvent( eventName ) );
		};

		const licenseState = getLicenseState( attachedAt, revokedAt );
		return [
			{
				name: translate( 'Prepare for launch' ),
				href: `https://wordpress.com/settings/general/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'prepare_for_launch' ),
				isExternalLink: true,
				isEnabled: isDevSite,
			},
			{
				name: translate( 'Set up site' ),
				href: `https://wordpress.com/overview/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_site_set_up_click' ),
				isExternalLink: true,
				isEnabled: true,
			},
			{
				name: translate( 'Change domain' ),
				href: `https://wordpress.com/domains/manage/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_change_domain_click' ),
				isExternalLink: true,
				isEnabled: true,
			},
			{
				name: translate( 'Hosting configuration' ),
				href: `https://wordpress.com/hosting-config/${ siteSlug }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_hosting_configuration_click' ),
				isExternalLink: true,
				isEnabled: true,
			},
			{
				name: translate( 'Edit site in WP Admin' ),
				href: `${ siteUrl }/wp-admin/admin.php?page=jetpack#/dashboard`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_edit_site_click' ),
				isExternalLink: true,
				isEnabled: true,
			},
			{
				name: translate( 'Debug site' ),
				href: `https://jptools.wordpress.com/debug/?url=${ siteUrl }`,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_debug_site_click' ),
				isExternalLink: true,
				isEnabled: licenseState === LicenseState.Attached,
			},
			{
				name: translate( 'Upgrade' ),
				href: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_upgrade_click' ),
				isExternalLink: false,
				isEnabled: ! isClientLicense,
			},
			{
				name: translate( 'Revoke' ),
				href: `https://wordpress.com/purchases/subscriptions/${ siteSlug }`,
				isExternalLink: true,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_hosting_configuration_click' ),
				type: 'revoke',
				isEnabled:
					canRevoke &&
					( isChildLicense
						? licenseState === LicenseState.Attached
						: licenseState !== LicenseState.Revoked ) &&
					licenseType === LicenseType.Partner,
				className: 'is-destructive',
			},
		];
	}, [
		attachedAt,
		canRevoke,
		dispatch,
		isChildLicense,
		isClientLicense,
		isDevSite,
		licenseType,
		revokedAt,
		siteUrl,
		translate,
	] );
}
