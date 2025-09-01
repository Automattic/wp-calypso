import { fetchUserTaxDetails, updateUserTaxDetails } from '@automattic/api-core';
import { queryClient } from '@automattic/api-queries';
import { queryOptions, mutationOptions } from '@tanstack/react-query';

export interface UpdateError {
	message: string;
	error: string;
}
export interface FetchError {
	message: string;
	error: string;
}

export const userTaxDetailsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'billing-purchases', 'tax-details' ],
		queryFn: fetchUserTaxDetails,
	} );

export const userTaxDetailsMutation = () =>
	mutationOptions( {
		mutationFn: updateUserTaxDetails,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userTaxDetailsQuery().queryKey,
				( oldData ) => oldData && { ...oldData, ...newData }
			);
		},
	} );
