import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { LicenseState, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	licenseState: LicenseState;
	licenseType: LicenseType;
	hasDownloads: boolean;
	isChildLicense?: boolean;
}

export default function LicenseDetailsActions( {
	licenseKey,
	siteUrl,
	licenseState,
	licenseType,
	hasDownloads,
	isChildLicense,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const debugUrl = ''; // TODO: Implement debug URL
	const downloadUrl = {
		isPending: false,
		url: '',
	}; // TODO: Implement download URL

	const openRevokeDialog = useCallback( () => {
		// TODO: Implement revoke dialog
		dispatch( recordTracksEvent( 'calypso_a4a_license_details_revoke_dialog_open' ) );
	}, [ dispatch ] );

	const download = useCallback( () => {
		// TODO: Implement download
		dispatch( recordTracksEvent( 'calypso_a4a_license_details_download' ) );
	}, [ dispatch ] );

	return (
		<div className="license-details__actions">
			{ hasDownloads &&
				licenseState === LicenseState.Attached &&
				licenseType === LicenseType.Partner && (
					<Button
						compact
						{ ...( downloadUrl.isPending ? { busy: true } : {} ) }
						onClick={ download }
					>
						{ translate( 'Download' ) }
					</Button>
				) }

			{ licenseState === LicenseState.Attached && siteUrl && (
				<Button compact href={ siteUrl } target="_blank" rel="noopener noreferrer">
					{ translate( 'View site' ) }
				</Button>
			) }

			{ licenseState === LicenseState.Attached && debugUrl && (
				<Button compact href={ debugUrl } target="_blank" rel="noopener noreferrer">
					{ translate( 'Debug site' ) }
				</Button>
			) }

			{ ( isChildLicense
				? licenseState === LicenseState.Attached
				: licenseState !== LicenseState.Revoked ) &&
				licenseType === LicenseType.Partner && (
					<Button compact onClick={ openRevokeDialog } scary>
						{ translate( 'Revoke' ) }
					</Button>
				) }

			{ licenseState === LicenseState.Detached && licenseType === LicenseType.Partner && (
				<Button
					compact
					primary
					className="license-details__assign-button"
					href={ addQueryArgs( { key: licenseKey }, '/marketplace/assign-license' ) }
				>
					{ translate( 'Assign License' ) }
				</Button>
			) }
		</div>
	);
}
