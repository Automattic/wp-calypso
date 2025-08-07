import { queryOptions } from '@tanstack/react-query';
import { fetchUserPaymentMethods } from '../../data/me-payment-methods';
import type { PaymentMethodRequestType } from '../../data/me-payment-methods';

export const userPaymentMethodsQuery = ( {
	type = 'all',
	expired = false,
	isForBusiness = false,
}: {
	/**
	 * The type of payment method to fetch.
	 *
	 * Defaults to 'all'.
	 */
	type?: PaymentMethodRequestType;

	/**
	 * True to also fetch expired payment methods.
	 *
	 * Defaults to false.
	 */
	expired?: boolean;

	/**
	 * Optionally filter methods by business use status
	 *
	 * Defaults to 'false'
	 */
	isForBusiness?: boolean | null;
} ) =>
	queryOptions( {
		queryKey: [ 'me', 'payment-methods', type, expired ],
		queryFn: () => fetchUserPaymentMethods( type, expired ),
		select: ( data ) =>
			Array.isArray( data ) && isForBusiness
				? data.filter( ( method ) => method?.tax_location?.is_for_business === isForBusiness )
				: data,
	} );
