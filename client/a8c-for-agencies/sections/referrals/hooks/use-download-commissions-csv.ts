import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { generateCommissionsCsv } from '../lib/generate-commissions-csv';
import type { Referral, ReferralCommissionPayoutResponse } from '../types';

export function useDownloadCommissionsCsv( isSingleClient?: boolean ) {
	const dispatch = useDispatch();

	const downloadCommissionsCsv = useCallback(
		(
			referrals: Referral[],
			products: APIProductFamilyProduct[],
			referralCommissionPayout?: ReferralCommissionPayoutResponse,
			clientEmail?: string
		): void => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_referrals_download_commissions_csv', {
					detailed_view: isSingleClient,
				} )
			);

			const csvContent = generateCommissionsCsv(
				referrals,
				products,
				referralCommissionPayout,
				isSingleClient
			);

			// Create Blob with CSV content
			const blob = new Blob( [ csvContent ], { type: 'text/csv;charset=utf-8;' } );

			// Generate filename with current date and optional client identifier
			const date = new Date().toISOString().split( 'T' )[ 0 ];
			const clientSuffix = clientEmail ? `-${ clientEmail.split( '@' )[ 0 ] }` : '';
			const filename = `referral-commissions${ clientSuffix }-${ date }.csv`;

			// Create download link
			const url = window.URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;
			link.download = filename;

			// Trigger download
			document.body.appendChild( link );
			link.click();
			document.body.removeChild( link );

			// Clean up
			window.URL.revokeObjectURL( url );
		},
		[ dispatch, isSingleClient ]
	);

	return { downloadCommissionsCsv };
}
