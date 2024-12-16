import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { isClientView } from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/lib/is-client-view';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { APIInvoices, Invoices, InvoiceStatus } from 'calypso/state/partner-portal/types';

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
	status,
}: {
	starting_after: string;
	ending_before: string;
	agencyId?: number;
	status?: InvoiceStatus;
} ) => {
	return isClientView()
		? [ 'a4a-client-invoices', starting_after, ending_before, status ]
		: [ 'a4a', 'invoices', starting_after, ending_before, agencyId, status ];
};

export default function useFetchInvoices(
	pagination: Pagination,
	options?: UseQueryOptions< APIInvoices, QueryError, Invoices >,
	status?: InvoiceStatus
): UseQueryResult< Invoices, QueryError > {
	const { starting_after, ending_before } = pagination;

	const agencyId = useSelector( getActiveAgencyId );
	const isClientUI = isClientView();

	return useQuery< APIInvoices, QueryError, Invoices >( {
		// isClientUI is used to send or not send the agency_id parameter to the API.
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: getFetchInvoicesQueryKey( { starting_after, ending_before, agencyId, status } ),
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: isClientUI
						? '/agency-client/stripe/invoices'
						: '/jetpack-licensing/partner/invoices',
				},
				{
					...( ! isClientUI && agencyId && { agency_id: agencyId } ),
					starting_after,
					ending_before,
					status,
				}
			),
		refetchOnWindowFocus: false,
		enabled: isClientUI || !! agencyId,
		select: selectInvoices,
		...options,
	} );
}
