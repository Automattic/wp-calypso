import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import useLicenseDownloadUrlMutation from 'calypso/components/data/query-jetpack-partner-portal-licenses/use-license-download-url-mutation';
import RevokeLicenseDialog from 'calypso/jetpack-cloud/sections/partner-portal/revoke-license-dialog';
import {
	LicenseRole,
	LicenseState,
	LicenseType,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { isJetpackCrmProduct } from '../lib';

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
	product,
	siteUrl,
	licenseState,
	licenseType,
	hasDownloads,
	isChildLicense,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ revokeDialog, setRevokeDialog ] = useState( false );
	const debugUrl = siteUrl ? `https://jptools.wordpress.com/debug/?url=${ siteUrl }` : null;
	const downloadUrl = useLicenseDownloadUrlMutation( licenseKey );
	const isValidCrmKey = isJetpackCrmProduct( licenseKey );

	const openRevokeDialog = useCallback( () => {
		setRevokeDialog( true );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_revoke_dialog_open' ) );
	}, [ dispatch, setRevokeDialog ] );

	const closeRevokeDialog = useCallback( () => {
		setRevokeDialog( false );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_revoke_dialog_close' ) );
	}, [ dispatch, setRevokeDialog ] );

	const download = useCallback( () => {
		downloadUrl.mutate( null, {
			onSuccess: ( data ) => {
				window.location.replace( data.download_url );
			},
			onError: ( error: Error ) => {
				dispatch( errorNotice( error.message ) );
			},
		} );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_download' ) );
	}, [ dispatch, downloadUrl.mutate ] );

	const viewJetpackCRMExtensions = useCallback( () => {
		try {
			dispatch( recordTracksEvent( 'calypso_partner_portal_license_details_view_crm_extensions' ) );
			page( `/partner-portal/download-products?products=${ licenseKey }` );
		} catch ( error ) {
			dispatch( errorNotice( translate( 'Failed to open download page. Please try again.' ) ) );
		}
	}, [ dispatch, licenseKey, translate ] );

	return (
		<div className="license-details__actions">
			{ config.isEnabled( 'jetpack/crm-downloads' ) && isValidCrmKey && (
				<Button compact onClick={ viewJetpackCRMExtensions }>
					{ translate( 'Download CRM Extensions' ) }
				</Button>
			) }
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
					href={ addQueryArgs( { key: licenseKey }, '/partner-portal/assign-license' ) }
				>
					{ translate( 'Assign License' ) }
				</Button>
			) }

			{ revokeDialog && (
				<RevokeLicenseDialog
					licenseKey={ licenseKey }
					product={ product }
					siteUrl={ siteUrl }
					onClose={ closeRevokeDialog }
					licenseRole={ isChildLicense ? LicenseRole.Child : LicenseRole.Single }
				/>
			) }
		</div>
	);
}
