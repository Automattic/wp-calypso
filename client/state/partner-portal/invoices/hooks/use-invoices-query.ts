import { useTranslate } from 'i18n-calypso';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';
import type { APIInvoices, Invoices } from 'calypso/state/partner-portal/types';

interface QueryError {
	code?: string;
}

function queryInvoices(): Promise< APIInvoices > {
	return wpcomJpl.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/partner/invoices',
	} );
}

function selectInvoices( api: APIInvoices ): Invoices {
	return {
		items: api.items.map( ( apiInvoice ) => ( {
			id: apiInvoice.id,
			dueDate: apiInvoice.due_date,
			status: apiInvoice.status,
			total: apiInvoice.total,
			currency: apiInvoice.currency,
			pdfUrl: apiInvoice.invoice_pdf,
		} ) ),
	};
}

export default function useInvoicesQuery(
	options?: UseQueryOptions< APIInvoices, QueryError, Invoices >
): UseQueryResult< Invoices, QueryError > {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	return useQuery< APIInvoices, QueryError, Invoices >(
		[ 'partner-portal', 'invoices', activeKeyId ],
		queryInvoices,
		{
			select: selectInvoices,
			onError: () => {
				dispatch(
					errorNotice( translate( 'We were unable to retrieve your invoices.' ), {
						id: 'partner-portal-invoices-failure',
					} )
				);
			},
			...options,
		}
	);
}
