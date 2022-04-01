import { useTranslate } from 'i18n-calypso';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';
import type { APIInvoice, Invoice } from 'calypso/state/partner-portal/types';

// @todo limit the data we return in the API just to the minimum necessary.
// @todo we should convert due_date to a string to match the rest of the licensing api.
// @todo implement pagination
interface QueryError {
	code?: string;
}

function queryInvoices(): Promise< APIInvoice[] > {
	return wpcomJpl.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/partner/invoices',
	} );
}

function selectInvoices( api: APIInvoice[] ): Invoice[] {
	return api.map( ( apiInvoice ) => ( {
		id: apiInvoice.id,
		dueDate: apiInvoice.due_date,
		status: apiInvoice.status,
		total: apiInvoice.total,
		pdfUrl: apiInvoice.invoice_pdf,
	} ) );
}

export default function useInvoicesQuery(
	options?: UseQueryOptions< APIInvoice[], QueryError, Invoice[] >
): UseQueryResult< Invoice[], QueryError > {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	return useQuery< APIInvoice[], QueryError, Invoice[] >(
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
