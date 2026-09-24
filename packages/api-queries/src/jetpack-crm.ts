import { fetchJetpackCrmExtensionDownload, fetchJetpackCrmExtensions } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export const jetpackCrmExtensionsQuery = ( appUrl: string ) =>
	queryOptions( {
		queryKey: [ 'jetpack-crm', appUrl, 'extensions' ],
		queryFn: () => fetchJetpackCrmExtensions( appUrl ),
		select: ( extensions ) => [ ...extensions ].sort( ( a, b ) => a.name.localeCompare( b.name ) ),
	} );

export const jetpackCrmExtensionDownloadMutation = ( appUrl: string, licenseKey: string ) =>
	mutationOptions( {
		meta: { statId: 'jetpack-crm-extension-download' },
		mutationFn: ( extensionSlug: string ) =>
			fetchJetpackCrmExtensionDownload( appUrl, licenseKey, extensionSlug ),
	} );
