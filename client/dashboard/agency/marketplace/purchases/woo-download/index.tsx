import {
	activeAgencyQuery,
	jetpackAgencyLicenseDownloadUrlMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Modal, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../../app/analytics';
import { ButtonStack } from '../../../../components/button-stack';
import ClipboardInputControl from '../../../../components/clipboard-input-control';
import { Text } from '../../../../components/text';
import { closeWooDownload, useWooDownloadRequest, type WooDownloadRequest } from './store';

/**
 * Woo extensions aren't installed on assignment, so the agency downloads the
 * extension and uploads it to the site, then activates it with the license key.
 */
function WooDownloadStep( { licenseKey, productName, siteUrl }: WooDownloadRequest ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const download = useMutation( jetpackAgencyLicenseDownloadUrlMutation( agency?.id ) );

	const handleDownload = () => {
		recordTracksEvent( 'calypso_a4a_license_assign_download_click' );
		download.mutate( licenseKey, {
			onSuccess: ( { download_url } ) => window.location.assign( download_url ),
			onError: ( error ) =>
				createErrorNotice(
					error.message || __( 'Failed to download the product. Please try again.' ),
					{ type: 'snackbar' }
				),
		} );
	};

	return (
		<VStack spacing={ 6 }>
			<Text>
				{ createInterpolateElement(
					__(
						'<product /> has been assigned to <site />, but more action is required. Download the extension, then upload and activate it on the site.'
					),
					{ product: <>{ productName }</>, site: <Text weight={ 600 }>{ siteUrl }</Text> }
				) }
			</Text>
			<ClipboardInputControl
				label={ __( 'License key' ) }
				value={ licenseKey }
				readOnly
				onCopy={ () => {
					recordTracksEvent( 'calypso_a4a_license_assign_copy_license_key_click' );
					createSuccessNotice( __( 'License key copied to clipboard.' ), { type: 'snackbar' } );
				} }
			/>
			<ButtonStack justify="flex-end">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ closeWooDownload }>
					{ __( 'Done' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isBusy={ download.isPending }
					disabled={ download.isPending }
					accessibleWhenDisabled
					onClick={ handleDownload }
				>
					{ __( 'Download' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}

export default function WooDownloadModalHost() {
	const request = useWooDownloadRequest();
	if ( ! request ) {
		return null;
	}
	return (
		<Modal
			title={ __( 'Download your extension' ) }
			size="medium"
			onRequestClose={ closeWooDownload }
		>
			<WooDownloadStep { ...request } />
		</Modal>
	);
}
