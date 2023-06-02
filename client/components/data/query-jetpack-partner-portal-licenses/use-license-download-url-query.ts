import { useQuery } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';

interface APILicenseDownload {
	download_url: string;
}

export default function useLicenseDownloadUrlQuery( licenseKey: string ) {
	return useQuery( {
		queryKey: [ 'jetpack-partner-portal-license-download-url', licenseKey ],
		queryFn: () =>
			wpcomJpl.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/jetpack-licensing/license/${ licenseKey }/download`,
			} ) as Promise< APILicenseDownload >,
		select: ( data ) => ( { downloadUrl: data.download_url } ),
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	} );
}
