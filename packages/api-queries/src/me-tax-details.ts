import { queryOptions } from '@tanstack/react-query';
import { fetchUserTaxDetails, UserTaxDetails } from '../../data/me-tax-details';
import type { FetchError } from '../../me/tax-details/user-tax-form';

export const userTaxDetailsQuery = () =>
	queryOptions< UserTaxDetails, FetchError >( {
		queryKey: [ 'me', 'billing', 'tax-details' ],
		queryFn: fetchUserTaxDetails,
	} );
