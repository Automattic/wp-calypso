import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect } from 'react';
import CancelLicenseFeedbackModal from 'calypso/a8c-for-agencies/components/a4a-feedback/churn-mechanism/cancel-license-feedback-modal';
import {
	A4A_MARKETPLACE_ASSIGN_LICENSE_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	EXTERNAL_PRESSABLE_AUTH_URL,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	isPressableAddonProduct,
	isPressableHostingProduct,
	isWPCOMHostingProduct,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import isJetpackCrmProduct from 'calypso/components/crm-downloads/is-jetpack-crm-product';
import { LicenseState, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import CreateSiteButton from '../create-site-button';
import useCreateSiteFromLicense from '../hooks/use-create-site-from-license';
import useLicenseDownloadUrlMutation from '../revoke-license-dialog/hooks/use-license-download-url-mutation';
import type { LicenseSubscription } from 'calypso/state/partner-portal/types';

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
	subscription?: LicenseSubscription | null;
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
	subscription,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const canRevoke = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_revoke_licenses' )
	);

	const [ revokeDialog, setRevokeDialog ] = useState( false );
	const isPressableLicense = isPressableHostingProduct( licenseKey );
	const isPressableAddonLicense =
		isPressableAddonProduct( licenseKey ) || isPressableAddonProduct( product );
	const isWPCOMHostingLicense = isWPCOMHostingProduct( licenseKey );
	const isAutoRenewDisabled =
		subscription?.status === 'active' && ! subscription.isAutoRenewEnabled;

	const debugUrl = siteUrl ? `https://jptools.wordpress.com/debug/?url=${ siteUrl }` : null;
	const downloadUrl = useLicenseDownloadUrlMutation( licenseKey );

	const assignLicenseUrl = addQueryArgs( { key: licenseKey }, A4A_MARKETPLACE_ASSIGN_LICENSE_LINK );

	const {
		onCreateSite,
		isProvisioning,
		isLoading: isLoadingPendingSites,
		modal: siteConfigurationsModal,
	} = useCreateSiteFromLicense( licenseKey );

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
		dispatch(
			recordTracksEvent( 'calypso_a4a_license_details_download', { license_state: licenseState } )
		);
	}, [ dispatch, mutate, licenseState ] );

	return (
		<div className="license-details__actions">
			{ hasDownloads &&
				licenseState !== LicenseState.Revoked &&
				licenseType === LicenseType.Partner && (
					<Button
						compact
						{ ...( status === 'pending' ? { busy: true } : {} ) }
						onClick={ download }
					>
						{ translate( 'Download' ) }
					</Button>
				) }

			{ config.isEnabled( 'jetpack/crm-downloads' ) &&
				licenseState === LicenseState.Attached &&
				isJetpackCrmProduct( licenseKey ) && (
					<Button compact href={ `/purchases/crm-downloads/${ licenseKey }` }>
						{ translate( 'Download Jetpack CRM Extensions' ) }
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

			{ isPressableLicense &&
				( licenseState === LicenseState.Attached ||
					( isPressableAddonLicense && licenseState !== LicenseState.Revoked ) ) && (
					<Button
						primary
						compact
						href={ EXTERNAL_PRESSABLE_AUTH_URL }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ translate( 'Manage in Pressable ↗' ) }
					</Button>
				) }

			{ ( isPressableLicense || isWPCOMHostingLicense ) &&
				licenseState !== LicenseState.Revoked &&
				! isDevSite &&
				! isClientLicense &&
				! isPressableAddonLicense &&
				! isAutoRenewDisabled && (
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
				! isClientLicense &&
				( isChildLicense
					? licenseState === LicenseState.Attached
					: licenseState !== LicenseState.Revoked ) &&
				licenseType === LicenseType.Partner &&
				! isAutoRenewDisabled && (
					<Button compact onClick={ openRevokeDialog } scary>
						{ translate( 'Revoke' ) }
					</Button>
				) }

			{ ! isPressableAddonLicense &&
				licenseState === LicenseState.Detached &&
				licenseType === LicenseType.Partner &&
				( isWPCOMHostingLicense ? (
					<CreateSiteButton
						className="license-details__assign-button"
						primary
						isProvisioning={ isProvisioning }
						isLoading={ isLoadingPendingSites }
						onCreateSite={ onCreateSite }
					/>
				) : (
					<Button
						compact
						primary
						className="license-details__assign-button"
						href={ assignLicenseUrl }
					>
						{ translate( 'Assign license' ) }
					</Button>
				) ) }

			{ siteConfigurationsModal }

			{ revokeDialog && (
				<CancelLicenseFeedbackModal
					productName={ product }
					licenseKey={ licenseKey }
					productId={ productId }
					siteUrl={ siteUrl }
					onClose={ closeRevokeDialog }
					isClientLicense={ isClientLicense }
					isChildLicense={ isChildLicense }
				/>
			) }
		</div>
	);
}
