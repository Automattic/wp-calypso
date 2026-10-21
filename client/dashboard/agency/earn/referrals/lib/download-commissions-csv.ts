import { generateCommissionsCsv } from './generate-commissions-csv';
import type { AgencyProduct, Referral, ReferralCommissionPayout } from '@automattic/api-core';

interface DownloadCommissionsCsvArgs {
	referrals: Referral[];
	products: AgencyProduct[];
	referralCommissionPayout?: ReferralCommissionPayout;
	isSingleClient?: boolean;
	clientEmail?: string;
}

export function downloadCommissionsCsv( {
	referrals,
	products,
	referralCommissionPayout,
	isSingleClient,
	clientEmail,
}: DownloadCommissionsCsvArgs ): void {
	const csvContent = generateCommissionsCsv(
		referrals,
		products,
		referralCommissionPayout,
		isSingleClient
	);

	const blob = new Blob( [ csvContent ], { type: 'text/csv;charset=utf-8;' } );

	const date = new Date().toISOString().split( 'T' )[ 0 ];
	const clientSuffix = clientEmail ? `-${ clientEmail.split( '@' )[ 0 ] }` : '';
	const filename = `referral-commissions${ clientSuffix }-${ date }.csv`;

	const url = window.URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	link.href = url;
	link.download = filename;

	document.body.appendChild( link );
	link.click();
	document.body.removeChild( link );

	window.URL.revokeObjectURL( url );
}
