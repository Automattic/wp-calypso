import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { getFetchInvoicesQueryKey } from 'calypso/a8c-for-agencies/data/purchases/use-fetch-invoices';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { APIInvoice } from 'calypso/state/partner-portal/types';

interface PayInvoiceMutationVariables {
	invoiceId: string;
}

export default function usePayInvoiceMutation< TContext = unknown >(
	options?: UseMutationOptions< APIInvoice, Error, PayInvoiceMutationVariables, TContext >
): UseMutationResult< APIInvoice, Error, PayInvoiceMutationVariables, TContext > {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	const mutation = useMutation< APIInvoice, Error, PayInvoiceMutationVariables, TContext >( {
		mutationFn: ( { invoiceId } ) =>
			wpcom.req.post(
				{
					apiNamespace: 'wpcom/v2',
					path: `/jetpack-licensing/partner/invoice/${ invoiceId }/payment`,
				},
				{
					agency_id: agencyId,
				}
			),
		...options,
	} );

	const { isSuccess, isError, error, data } = mutation;

	useEffect( () => {
		if ( isSuccess ) {
			queryClient.invalidateQueries( {
				queryKey: getFetchInvoicesQueryKey( {
					starting_after: '',
					ending_before: '',
					agencyId: agencyId,
				} ),
			} );
			dispatch(
				successNotice(
					translate( 'Invoice %s settled successfully.', {
						args: [ data.id ],
					} ),
					{
						id: 'a4a-pay-invoice-success',
					}
				)
			);
		}
	}, [ isSuccess, dispatch, data, agencyId, queryClient, translate ] );

	useEffect( () => {
		if ( isError ) {
			dispatch( errorNotice( error.message, { id: 'a4a-pay-invoice-failure' } ) );
		}
	}, [ isError, dispatch, error?.message ] );

	return mutation;
}
