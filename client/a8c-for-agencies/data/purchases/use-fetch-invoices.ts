import config from '@automattic/calypso-config';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { APIInvoices, Invoices } from 'calypso/state/partner-portal/types';

interface QueryError {
	code?: string;
}

interface Pagination {
	starting_after: string;
	ending_before: string;
}

const showDummyData = config.isEnabled( 'a4a/mock-api-data' );

function queryInvoices() {
	if ( showDummyData ) {
		return {
			items: [
				{
					id: 'in_test',
					number: 'TEST-0132',
					due_date: null,
					status: 'paid',
					total: 0,
					currency: 'usd',
					invoice_pdf: 'www.example.com/invoice.pdf',
				},
				{
					id: 'in_test2',
					number: 'TEST-0131',
					due_date: null,
					status: 'void',
					total: 0,
					currency: 'usd',
					invoice_pdf: 'www.example.com/invoice.pdf',
				},
			],
			has_more: false,
		} as APIInvoices;
	}
	return {
		items: [],
		has_more: false,
	};
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

export default function useFetchInvoices(
	pagination: Pagination,
	options?: UseQueryOptions< APIInvoices, QueryError, Invoices >
): UseQueryResult< Invoices, QueryError > {
	const activeKeyId = 'test'; // FIXME: Get active key ID from state

	return useQuery< APIInvoices, QueryError, Invoices >( {
		queryKey: [ 'a4a', 'invoices', activeKeyId, pagination ],
		queryFn: queryInvoices,
		refetchOnWindowFocus: false,
		select: selectInvoices,
		...options,
	} );
}
