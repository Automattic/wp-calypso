import { useMutation } from '@tanstack/react-query';

const BASE_CRM_APP_URL = 'https://app.jetpackcrm.com';

async function fetchExtensionDownloads( licenseKey: string, extensionSlug: string ) {
	// API URL for downloads
	const apiUrl = `${ BASE_CRM_APP_URL }/api/downloads/jetpack-complete`;

	const response = await fetch( apiUrl, {
		method: 'POST',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify( {
			license_key: licenseKey,
			extension_slug: extensionSlug,
		} ),
	} );

	if ( ! response.ok ) {
		// Handle error based on status code
		switch ( response.status ) {
			case 400:
				throw new Error( 'Missing required fields' );
			case 401:
				throw new Error( 'Invalid API key' );
			case 403:
				throw new Error( 'Invalid license key format. Must be a Jetpack Complete license key.' );
			case 404:
				throw new Error( 'Extension not found' );
			default:
				throw new Error(
					'Could not connect to download server. Please check your connection and try again.'
				);
		}
	}

	const data = await response.json();
	if ( ! data.success ) {
		throw new Error( data.message || null );
		return;
	}

	return data;
}

export default function useHandleExtensionsDownloadMutation( licenseKey: string ) {
	return useMutation( {
		mutationKey: [ 'use-handle-jetpack-crm-extensions-download', licenseKey ],
		mutationFn: ( extensionSlug: string ) => fetchExtensionDownloads( licenseKey, extensionSlug ),
	} );
}
