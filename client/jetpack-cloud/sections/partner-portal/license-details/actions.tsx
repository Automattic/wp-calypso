/**
 * External dependencies
 */
import React, { ReactElement, useCallback, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getLicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import RevokeLicenseDialog from 'calypso/jetpack-cloud/sections/partner-portal/revoke-license-dialog';

interface Props {
	licenseKey: string;
	product: string;
	domain: string;
	attachedAt: string | null;
	revokedAt: string | null;
}

export default function LicenseDetailsActions( {
	licenseKey,
	product,
	domain,
	attachedAt,
	revokedAt,
}: Props ): ReactElement {
	const translate = useTranslate();
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const [ revokeDialog, setRevokeDialog ] = useState( false );

	const openRevokeDialog = useCallback( () => {
		setRevokeDialog( true );
	}, [ setRevokeDialog ] );

	const closeRevokeDialog = useCallback( () => {
		setRevokeDialog( false );
	}, [ setRevokeDialog ] );

	return (
		<div className="license-details__actions">
			{ licenseState !== LicenseState.Revoked && (
				<Button onClick={ openRevokeDialog } scary>
					{ translate( 'Revoke License' ) }
				</Button>
			) }

			{ revokeDialog && (
				<RevokeLicenseDialog
					licenseKey={ licenseKey }
					product={ product }
					domain={ domain }
					onClose={ closeRevokeDialog }
				/>
			) }
		</div>
	);
}
