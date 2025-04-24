import { Button } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect } from 'react';
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
import { LicenseState, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useLicenseDownloadUrlMutation from '../revoke-license-dialog/hooks/use-license-download-url-mutation';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	licenseState: LicenseState;
	licenseType: LicenseType;
	hasDownloads: boolean;
	isChildLicense?: boolean;
	isClientLicense?: boolean;
	isDevSite?: boolean;
	productId?: number;
}

export default function LicenseDetailsActions( {
	licenseKey,
	product,
	siteUrl,
	licenseState,
	licenseType,
	hasDownloads,
	isChildLicense,
	isClientLicense,
	isDevSite,
	productId,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const canRevoke = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_revoke_licenses' )
	);

	const [ revokeDialog, setRevokeDialog ] = useState( false );
	const isPressableLicense = isPressableHostingProduct( licenseKey );
	const isWPCOMHostingLicense = isWPCOMHostingProduct( licenseKey );
	const pressableManageUrl = 'https://my.pressable.com/agency/auth';

	const debugUrl = siteUrl ? `https://jptools.wordpress.com/debug/?url=${ siteUrl }` : null;
	const downloadUrl = useLicenseDownloadUrlMutation( licenseKey );

	const redirectUrl = isWPCOMHostingLicense
		? A4A_SITES_LINK_NEEDS_SETUP
		: addQueryArgs( { key: licenseKey }, A4A_MARKETPLACE_ASSIGN_LICENSE_LINK );

	const openRevokeDialog = useCallback( () => {
		setRevokeDialog( true );
		dispatch( recordTracksEvent( 'calypso_a4a_license_details_revoke_dialog_open' ) );
	}, [ dispatch ] );

	const closeRevokeDialog = useCallback( () => {
		setRevokeDialog( false );
		dispatch( recordTracksEvent( 'calypso_a4a_license_details_revoke_dialog_close' ) );
	}, [ dispatch ] );

	const { mutate, status, error, data } = downloadUrl;

	useEffect( () => {
		if ( status === 'success' ) {
			window.location.replace( data.download_url );
		} else if ( status === 'error' ) {
			dispatch( errorNotice( error.message ) );
		}
	}, [ status, error, dispatch, data ] );

	const download = useCallback( () => {
		mutate( null );
		dispatch( recordTracksEvent( 'calypso_a4a_license_details_download' ) );
	}, [ dispatch, mutate ] );

	return (
		<div className="license-details__actions">
			{ hasDownloads &&
				licenseState === LicenseState.Attached &&
				licenseType === LicenseType.Partner && (
					<Button
						compact
						{ ...( status === 'pending' ? { busy: true } : {} ) }
						onClick={ download }
					>
						{ translate( 'Download' ) }
					</Button>
				) }

			{ ! isPressableLicense && licenseState === LicenseState.Attached && siteUrl && (
				<Button compact href={ siteUrl } target="_blank" rel="noopener noreferrer">
					{ translate( 'View site' ) }
				</Button>
			) }

			{ ! isPressableLicense && licenseState === LicenseState.Attached && debugUrl && (
				<Button compact href={ debugUrl } target="_blank" rel="noopener noreferrer">
					{ translate( 'Debug site' ) }
				</Button>
			) }

			{ isPressableLicense && licenseState === LicenseState.Attached && (
				<Button
					primary
					compact
					href={ pressableManageUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'Manage in Pressable' ) } <Icon icon={ external } size={ 18 } />
				</Button>
			) }

			{ ( isPressableLicense || isWPCOMHostingLicense ) &&
				licenseState !== LicenseState.Revoked &&
				! isDevSite &&
				! isClientLicense && (
					<Button
						compact
						href={
							isPressableLicense
								? A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK
								: A4A_MARKETPLACE_HOSTING_WPCOM_LINK
						}
					>
						{ translate( 'Upgrade' ) }
					</Button>
				) }

			{ canRevoke &&
				( isChildLicense
					? licenseState === LicenseState.Attached
					: licenseState !== LicenseState.Revoked ) &&
				licenseType === LicenseType.Partner && (
					<Button compact onClick={ openRevokeDialog } scary>
						{ translate( 'Revoke' ) }
					</Button>
				) }

			{ licenseState === LicenseState.Detached && licenseType === LicenseType.Partner && (
				<Button compact primary className="license-details__assign-button" href={ redirectUrl }>
					{ isWPCOMHostingLicense ? translate( 'Create site' ) : translate( 'Assign license' ) }
				</Button>
			) }

			{ revokeDialog && (
				<CancelLicenseFeedbackModal
					productName={ product }
					licenseKey={ licenseKey }
					productId={ productId }
					siteUrl={ siteUrl }
					onClose={ closeRevokeDialog }
					isClientLicense={ isClientLicense }
				/>
			) }
		</div>
	);
}
