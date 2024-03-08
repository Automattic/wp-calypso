import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import type { APIInvoice } from 'calypso/state/partner-portal/types';

interface PayInvoiceMutationVariables {
	invoiceId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = () => Promise.resolve() as unknown as Promise< APIInvoice >;

export default function usePayInvoiceMutation< TContext = unknown >(
	options?: UseMutationOptions< APIInvoice, Error, PayInvoiceMutationVariables, TContext >
): UseMutationResult< APIInvoice, Error, PayInvoiceMutationVariables, TContext > {
	return useMutation< APIInvoice, Error, PayInvoiceMutationVariables, TContext >( {
		mutationFn: noop, // Implement actual API call
		...options,
	} );
}
