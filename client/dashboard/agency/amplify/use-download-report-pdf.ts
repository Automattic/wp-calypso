import { fetchAmplifyReportPdf } from '@automattic/api-core';
import { useCallback, useState } from 'react';

export function useDownloadReportPdf( agencyId: number ) {
	const [ downloadingId, setDownloadingId ] = useState< string | null >( null );

	const downloadReportPdf = useCallback(
		async ( reportId: string ): Promise< void > => {
			setDownloadingId( reportId );
			try {
				const { filename, data } = await fetchAmplifyReportPdf( agencyId, reportId );

				const bytes = Uint8Array.from( window.atob( data ), ( char ) => char.charCodeAt( 0 ) );
				const blob = new Blob( [ bytes ], { type: 'application/pdf' } );

				const url = window.URL.createObjectURL( blob );
				const link = document.createElement( 'a' );
				link.href = url;
				link.download = filename;

				document.body.appendChild( link );
				link.click();
				document.body.removeChild( link );

				window.URL.revokeObjectURL( url );
			} finally {
				setDownloadingId( null );
			}
		},
		[ agencyId ]
	);

	return { downloadReportPdf, downloadingId };
}
