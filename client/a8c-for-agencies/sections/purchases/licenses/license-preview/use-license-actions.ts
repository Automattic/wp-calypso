import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import getLicenseState from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-license-state';
import {
	LicenseState,
	LicenseAction,
	LicenseType,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function useLicenseActions(
	siteUrl: string | null,
	attachedAt: string | null,
	revokedAt: string | null,
	licenseType: LicenseType,
	isChildLicense?: boolean
): LicenseAction[] {
	const translate = useTranslate();
	const dispatch = useDispatch();

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
				name: translate( 'Set up site' ),
				href: `https://wordpress.com/home/${ siteSlug }`,
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
				name: translate( 'Revoke' ),
				href: `https://wordpress.com/purchases/subscriptions/${ siteSlug }`,
				isExternalLink: true,
				onClick: () => handleClickMenuItem( 'calypso_a4a_licenses_hosting_configuration_click' ),
				type: 'revoke',
				isEnabled:
					( isChildLicense
						? licenseState === LicenseState.Attached
						: licenseState !== LicenseState.Revoked ) && licenseType === LicenseType.Partner,
				className: 'is-destructive',
			},
		];
	}, [ attachedAt, dispatch, isChildLicense, licenseType, revokedAt, siteUrl, translate ] );
}
