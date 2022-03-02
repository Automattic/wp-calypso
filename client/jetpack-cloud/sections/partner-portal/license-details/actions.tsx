import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import RevokeLicenseDialog from 'calypso/jetpack-cloud/sections/partner-portal/revoke-license-dialog';
import { LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { getLicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	attachedAt: string | null;
	revokedAt: string | null;
}

export default function LicenseDetailsActions( {
	licenseKey,
	product,
	siteUrl,
	attachedAt,
	revokedAt,
}: Props ): ReactElement {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const [ revokeDialog, setRevokeDialog ] = useState( false );

	const openRevokeDialog = useCallback( () => {
		setRevokeDialog( true );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_revoke_dialog_open' ) );
	}, [ dispatch, setRevokeDialog ] );

	const closeRevokeDialog = useCallback( () => {
		setRevokeDialog( false );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_revoke_dialog_close' ) );
	}, [ dispatch, setRevokeDialog ] );

	return (
		<div className="license-details__actions">
			{ licenseState !== LicenseState.Revoked && (
				<Button onClick={ openRevokeDialog } scary>
					{ translate( 'Revoke License' ) }
				</Button>
			) }

			{ licenseState === LicenseState.Detached && (
				<Button href={ addQueryArgs( { key: licenseKey }, '/partner-portal/assign-license' ) }>
					{ translate( 'Assign License' ) }
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
		</div>
	);
}
