import { fetchAgencyWooPaymentsCommissionsReport } from '@automattic/api-core';
import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useDownloadCommissionsReport() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const downloadCommissionsReport = useCallback(
		async ( siteId: number ): Promise< void > => {
			if ( ! agencyId ) {
				return;
			}

			const response = await fetchAgencyWooPaymentsCommissionsReport( agencyId, siteId );

			// CSV content is in response.data as a string.
			const blob = new Blob( [ response.data ], { type: 'text/csv;charset=utf-8;' } );

			const url = window.URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;
			link.download = response.filename;

			document.body.appendChild( link );
			link.click();
			document.body.removeChild( link );

			window.URL.revokeObjectURL( url );
		},
		[ agencyId ]
	);

	return { downloadCommissionsReport };
}
