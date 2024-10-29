import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import ActionCard from 'calypso/components/action-card';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import useLicenseDownloadUrlMutation from '../../purchases/licenses/revoke-license-dialog/hooks/use-license-download-url-mutation';

interface WooProductDownloadProps {
	licenseKey: string;
	allProducts: APIProductFamilyProduct[] | undefined;
}

export default function WooProductDownload( { licenseKey, allProducts }: WooProductDownloadProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const productSlug = licenseKey.split( '_' )[ 0 ];
	const product =
		allProducts && allProducts.find( ( product ) => product.slug.startsWith( productSlug ) );
	const downloadUrl = useLicenseDownloadUrlMutation( licenseKey );

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
		dispatch( recordTracksEvent( 'calypso_marketplace_a4a_download_from_assign' ) );
	}, [ dispatch, mutate ] );

	const onCopyLicense = useCallback( () => {
		dispatch( infoNotice( translate( 'License copied!' ), { duration: 2000 } ) );
		dispatch( recordTracksEvent( 'calypso_marketplace_a4a_download_copy_license_key' ) );
	}, [ dispatch, translate ] );

	return (
		<div className="download-products-list">
			<ActionCard
				headerText={ product?.name ?? '' }
				mainText={
					<div className="license-key">
						<code className="license-details__license-key">{ licenseKey }</code>

						<ClipboardButton
							text={ licenseKey }
							className="license-details__clipboard-button"
							borderless
							compact
							onCopy={ onCopyLicense }
						>
							<Gridicon icon="clipboard" />
						</ClipboardButton>
					</div>
				}
				buttonText={ translate( 'Download' ) }
				buttonOnClick={ download }
				buttonDisabled={ status === 'pending' }
			/>
		</div>
	);
}
