import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useLicenseDownloadUrlMutation from 'calypso/components/data/query-jetpack-partner-portal-licenses/use-license-download-url-mutation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';

export default function WooProductDownload( { licenseKey, allProducts } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const productSlug = licenseKey.split( '_' )[ 0 ];
	const product = allProducts && allProducts.find( ( product ) => product.slug === productSlug );
	const downloadUrl = useLicenseDownloadUrlMutation( licenseKey );

	const download = useCallback( () => {
		downloadUrl.mutate( null, {
			onSuccess: ( data ) => window.location.replace( data.download_url ),
			onError: ( error: Error ) => dispatch( errorNotice( error.message ) ),
		} );
		dispatch( recordTracksEvent( 'calypso_partner_portal_download_from_assign' ) );
	}, [ dispatch, downloadUrl.mutate ] );

	return (
		<li>
			<h5>{ product && product.name }</h5>
			<pre>{ licenseKey }</pre>
			<Button compact { ...( downloadUrl.isLoading ? { busy: true } : {} ) } onClick={ download }>
				{ translate( 'Download' ) }
			</Button>
		</li>
	);
}
