import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { addQueryArgs } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { APIInvoices, Invoices } from 'calypso/state/partner-portal/types';

interface QueryError {
	code?: string;
}

interface Pagination {
	starting_after: string;
	ending_before: string;
}

function selectInvoices( api: APIInvoices ): Invoices {
	return {
		items: api.items.map( ( apiInvoice ) => ( {
			id: apiInvoice.id,
			number: apiInvoice.number,
			dueDate: apiInvoice.due_date,
			created: apiInvoice.created,
			effectiveAt: apiInvoice.effective_at,
			status: apiInvoice.status,
			total: apiInvoice.total,
			currency: apiInvoice.currency,
			pdfUrl: apiInvoice.invoice_pdf,
		} ) ),
		hasMore: api.has_more,
	};
}

export const getFetchInvoicesQueryKey = ( {
	starting_after,
	ending_before,
	agencyId,
}: {
	starting_after: string;
	ending_before: string;
	agencyId?: number;
} ) => {
	return [ 'a4a', 'invoices', starting_after, ending_before, agencyId ];
};

export default function useFetchInvoices(
	pagination: Pagination,
	options?: UseQueryOptions< APIInvoices, QueryError, Invoices >
): UseQueryResult< Invoices, QueryError > {
	const { starting_after, ending_before } = pagination;
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< APIInvoices, QueryError, Invoices >( {
		queryKey: getFetchInvoicesQueryKey( { starting_after, ending_before, agencyId } ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: addQueryArgs(
					{ starting_after, ending_before, agency_id: agencyId },
					'/jetpack-licensing/partner/invoices'
				),
			} ),
		refetchOnWindowFocus: false,
		enabled: !! agencyId,
		select: selectInvoices,
		...options,
	} );
}
