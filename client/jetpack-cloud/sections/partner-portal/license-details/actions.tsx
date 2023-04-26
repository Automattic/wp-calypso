import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import RevokeLicenseDialog from 'calypso/jetpack-cloud/sections/partner-portal/revoke-license-dialog';
import { LicenseState, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import UnassignLicenseDialog from 'calypso/jetpack-cloud/sections/partner-portal/unassign-license-dialog';
import { getLicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	attachedAt: string | null;
	revokedAt: string | null;
	licenseState: LicenseState;
	licenseType: LicenseType;
}

export default function LicenseDetailsActions( {
	licenseKey,
	product,
	siteUrl,
	attachedAt,
	revokedAt,
	licenseState,
	licenseType,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ revokeDialog, setRevokeDialog ] = useState( false );
	const [ unassignDialog, setUnassignDialog ] = useState( false );
	const debugUrl = siteUrl ? `https://jptools.wordpress.com/debug/?url=${ siteUrl }` : null;

	const openRevokeDialog = useCallback( () => {
		setRevokeDialog( true );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_revoke_dialog_open' ) );
	}, [ dispatch, setRevokeDialog ] );

	const closeRevokeDialog = useCallback( () => {
		setRevokeDialog( false );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_revoke_dialog_close' ) );
	}, [ dispatch, setRevokeDialog ] );

	const openUnassignDialog = useCallback( () => {
		setUnassignDialog( true );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_unassign_dialog_open' ) );
	}, [ dispatch, setUnassignDialog ] );

	const closeUnassignDialog = useCallback( () => {
		setUnassignDialog( false );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_unassign_dialog_close' ) );
	}, [ dispatch, setUnassignDialog ] );

	return (
		<div className="license-details__actions">
			{ licenseState === LicenseState.Attached && siteUrl && (
				<>
					<Button external compact href={ siteUrl }>
						{ translate( 'View site' ) }
					</Button>
					<Button external compact href={ debugUrl }>
						{ translate( 'Debug site' ) }
					</Button>
				</>
			) }

			{ licenseState === LicenseState.Attached && licenseType === LicenseType.Partner && (
				<>
					<Button compact onClick={ openUnassignDialog }>
						{ translate( 'Unassign' ) }
					</Button>
					<Button compact onClick={ openRevokeDialog } scary>
						{ translate( 'Revoke' ) }
					</Button>
				</>
			) }

			{ licenseState == LicenseState.Detached && licenseType === LicenseType.Partner && (
				<Button compact onClick={ openRevokeDialog } scary>
					{ translate( 'Revoke' ) }
				</Button>
			) }

			{ revokeDialog && (
				<RevokeLicenseDialog
					licenseKey={ licenseKey }
					product={ product }
					siteUrl={ siteUrl }
					onClose={ closeRevokeDialog }
				/>
			) }

			{ unassignDialog && (
				<UnassignLicenseDialog
					licenseKey={ licenseKey }
					product={ product }
					siteUrl={ siteUrl }
					onClose={ closeUnassignDialog }
				/>
			) }
		</div>
	);
}
