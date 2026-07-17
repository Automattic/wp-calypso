import { fetchAgencyWooPaymentsCommissionsReport } from '@automattic/api-core';
import debugFactory from 'debug';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

const debug = debugFactory( 'calypso:a4a:use-download-commissions-report' );

export function useDownloadCommissionsReport() {
	const agencyId = useSelector( getActiveAgencyId );

	const downloadCommissionsReport = useCallback(
		async ( siteId: number ): Promise< void > => {
			if ( ! agencyId ) {
				return;
			}

			try {
				const response = await fetchAgencyWooPaymentsCommissionsReport( agencyId, siteId );

				// CSV content is in response.data as a string
				const csvContent = response.data;

				// Convert string to Blob with CSV MIME type
				const blob = new Blob( [ csvContent ], { type: 'text/csv;charset=utf-8;' } );

				// Create download link
				const url = window.URL.createObjectURL( blob );
				const link = document.createElement( 'a' );
				link.href = url;
				link.download = response.filename;

				// Trigger download
				document.body.appendChild( link );
				link.click();
				document.body.removeChild( link );

				// Clean up
				window.URL.revokeObjectURL( url );
			} catch ( error ) {
				debug( 'Failed to download commissions report:', error );
				throw error;
			}
		},
		[ agencyId ]
	);

	return { downloadCommissionsReport };
}
