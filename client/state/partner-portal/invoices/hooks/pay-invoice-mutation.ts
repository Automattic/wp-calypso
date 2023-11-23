import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { sprintf, __ } from '@wordpress/i18n';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
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
	const queryClient = useQueryClient();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	return useMutation< APIInvoice, Error, PayInvoiceMutationVariables, TContext >( {
		mutationFn: payInvoiceMutation,
		onSuccess: ( invoice: APIInvoice ) => {
			const invoicePages = queryClient.getQueriesData( {
				queryKey: [ 'partner-portal', 'invoices', activeKeyId ],
			} );

			invoicePages.forEach( ( query ) => {
				const data = query[ 1 ] as APIInvoices;
				const index = data.items.findIndex( ( apiInvoice ) => apiInvoice.id === invoice.id );

				if ( index > -1 ) {
					const spliced = [ ...data.items ];
					spliced.splice( index, 1, invoice );

					queryClient.setQueryData( query[ 0 ], {
						...data,
						items: spliced,
					} );
				}
			} );

			dispatch(
				successNotice(
					sprintf(
						/* translators: %s - the unique invoice number */
						__( 'Invoice %s settled successfully.' ),
						invoice.number
					),
					{
						id: 'partner-portal-pay-invoice-success',
					}
				)
			);
		},
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message, { id: 'partner-portal-pay-invoice-failure' } ) );
		},
		...options,
	} );
}
