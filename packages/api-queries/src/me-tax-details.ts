import { fetchUserTaxDetails, updateUserTaxDetails } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const userTaxDetailsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'billing-purchases', 'tax-details' ],
		queryFn: () => fetchUserTaxDetails(),
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
