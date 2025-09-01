import { fetchUserTaxDetails } from '@automattic/api-queries';
import { queryOptions } from '@tanstack/react-query';
import type { UserTaxDetails } from '@automattic/api-core';

export interface UpdateError {
	message: string;
	error: string;
}
export interface FetchError {
	message: string;
	error: string;
}

export const userTaxDetailsQuery = () =>
	queryOptions< UserTaxDetails, FetchError >( {
		queryKey: [ 'me', 'billing', 'tax-details' ],
		queryFn: fetchUserTaxDetails,
	} );
