import debugFactory from 'debug';
import { useCallback } from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

const debug = debugFactory( 'calypso:a4a:use-download-commissions-report' );

export function useDownloadCommissionsReport() {
	const agencyId = useSelector( getActiveAgencyId );

	const downloadCommissionsReport = useCallback(
		async ( siteId: number ): Promise< void > => {
			try {
				const response = await wpcom.req.get( {
					apiNamespace: 'wpcom/v2',
					path: addQueryArgs(
						{ format: 'csv' },
						`/agency/${ agencyId }/woocommerce/woopayments/${ siteId }`
					),
				} );

				// CSV content is in response.data as a string
				const csvContent = response.data as string;

				// Convert string to Blob with CSV MIME type
				const blob = new Blob( [ csvContent ], { type: 'text/csv;charset=utf-8;' } );

				// Create download link
				const url = window.URL.createObjectURL( blob );
				const link = document.createElement( 'a' );
				link.href = url;
				link.download = response.filename as string;

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
