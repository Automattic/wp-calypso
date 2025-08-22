import { queryOptions, mutationOptions } from '@tanstack/react-query';
import {
	fetchUserTaxDetails,
	updateUserTaxDetails,
	UserTaxDetails,
} from '../../data/me-tax-details';
import { queryClient } from '../query-client';
import type { UpdateError, FetchError } from '../../me/tax-details/user-tax-form';

export const userTaxDetailsQuery = () =>
	queryOptions< UserTaxDetails, FetchError >( {
		queryKey: [ 'me', 'billing', 'tax-details' ],
		queryFn: fetchUserTaxDetails,
	} );

export const userTaxDetailsMutation = () =>
	mutationOptions< UserTaxDetails, UpdateError, UserTaxDetails >( {
		mutationFn: updateUserTaxDetails,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userTaxDetailsQuery().queryKey,
				( oldData ) => oldData && { ...oldData, ...newData }
			);
		},
	} );
