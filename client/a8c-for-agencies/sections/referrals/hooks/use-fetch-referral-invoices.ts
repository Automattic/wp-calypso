import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { ReferralInvoiceAPIResponse, ReferralInvoice } from '../types';

export const getReferralInvoicesQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referral-invoices', agencyId ];
};

const getReferralInvoices = ( data: {
	invoices: { [ clientId: string ]: ReferralInvoiceAPIResponse[] };
} ): ReferralInvoice[] => {
	if ( ! data ) {
		return [];
	}
	const clientIds = Object.keys( data.invoices );

	return clientIds
		.map( ( clientId ) => {
			const clientInvoices = data.invoices[ clientId ];
			return clientInvoices.reduce( ( acc: ReferralInvoice[], invoice ) => {
				if ( invoice.status === 'void' ) {
					return acc;
				}

				let isPaid = false;
				let isDue = false;
				if ( invoice.amount_due > 0 ) {
					isDue = true;
				} else if ( invoice.amount_paid > 0 ) {
					isPaid = true;
				}

				acc.push( {
					...invoice,
					clientId: parseInt( clientId ),
					isPaid,
					isDue,
				} );

				return acc;
			}, [] );
		} )
		.flat();
};

export default function useFetchReferralInvoices( isEnabled: boolean ) {
	const agencyId = useSelector( getActiveAgencyId );

	const data = useQuery( {
		queryKey: getReferralInvoicesQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referrals/invoices`,
			} ),
		enabled: isEnabled && !! agencyId,
		select: getReferralInvoices,
		refetchOnWindowFocus: false,
	} );

	return data;
}
