import {
	useQuery,
	UseQueryOptions,
	UseQueryResult,
	QueryFunctionContext,
} from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';
import type { APIInvoices, Invoices } from 'calypso/state/partner-portal/types';

interface QueryError {
	code?: string;
}

interface Pagination {
	starting_after: string;
	ending_before: string;
}

function queryInvoices( context: QueryFunctionContext ): Promise< APIInvoices > {
	const { starting_after, ending_before } = context.queryKey[ 3 ] as Pagination;

	return wpcomJpl.req.get( {
		apiNamespace: 'wpcom/v2',
		path: addQueryArgs( { starting_after, ending_before }, '/jetpack-licensing/partner/invoices' ),
	} );
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

export default function useInvoicesQuery(
	pagination: Pagination,
	options?: UseQueryOptions< APIInvoices, QueryError, Invoices >
): UseQueryResult< Invoices, QueryError > {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	const query = useQuery< APIInvoices, QueryError, Invoices >( {
		queryKey: [ 'partner-portal', 'invoices', activeKeyId, pagination ],
		queryFn: queryInvoices,
		refetchOnWindowFocus: false,
		select: selectInvoices,
		...options,
	} );

	const { isError } = query;

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( translate( 'We were unable to retrieve your invoices.' ), {
					id: 'partner-portal-invoices-failure',
				} )
			);
		}
	}, [ dispatch, isError, translate ] );

	return query;
}
