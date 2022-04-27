import { useTranslate } from 'i18n-calypso';
import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';
import type { APIInvoice, APIInvoices } from 'calypso/state/partner-portal/types';

interface PayInvoiceMutationVariables {
	invoiceId: string;
}

function payInvoiceMutation( { invoiceId }: PayInvoiceMutationVariables ): Promise< APIInvoice > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/partner/invoice/${ invoiceId }/payment`,
	} );
}

export default function usePayInvoiceMutation< TContext = unknown >(
	options?: UseMutationOptions< APIInvoice, Error, PayInvoiceMutationVariables, TContext >
): UseMutationResult< APIInvoice, Error, PayInvoiceMutationVariables, TContext > {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	return useMutation< APIInvoice, Error, PayInvoiceMutationVariables, TContext >(
		payInvoiceMutation,
		{
			onSuccess: ( invoice: APIInvoice ) => {
				const invoicePages = queryClient.getQueriesData( [
					'partner-portal',
					'invoices',
					activeKeyId,
				] );

				invoicePages.forEach( ( query ) => {
					const data = query[ 1 ] as APIInvoices;
					const index = data.items.findIndex( ( apiInvoice ) => apiInvoice.id === invoice.id );

					if ( index > -1 ) {
						data.items.splice( index, 1, invoice );

						// @todo this triggers component render but the data is still old for some reason.
						queryClient.setQueryData( query[ 0 ], {
							...data,
							items: [ ...data.items ],
						} );
					}
				} );

				dispatch( successNotice( translate( 'Invoice settled successfully.' ) ) );
			},
			onError: ( error: Error ) => {
				dispatch( errorNotice( error.message, { id: 'partner-portal-pay-invoice-failure' } ) );
			},
			...options,
		}
	);
}
