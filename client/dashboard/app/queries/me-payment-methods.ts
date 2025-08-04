import { queryOptions } from '@tanstack/react-query';
import {
	fetchPaymentMethods,
	type PaymentMethodRequestType,
	type StoredPaymentMethod,
} from '../../data/me-payment-methods';

const storedPaymentMethodsQueryKey = 'payment-methods';

export const paymentMethodsQuery = ( {
	type = 'all',
	expired = false,
	isLoggedOut = false,
	isForBusiness = false,
}: {
	/**
	 * If there is no logged-in user, we will not try to fetch anything.
	 */
	isLoggedOut?: boolean;

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
		queryKey: [ storedPaymentMethodsQueryKey, type, expired ],
		queryFn: () => fetchPaymentMethods( type, expired ),
		enabled: ! isLoggedOut,
		select: ( data: undefined | Array< StoredPaymentMethod > ) =>
			Array.isArray( data ) && isForBusiness
				? data.filter( ( method ) => method?.tax_location?.is_for_business === isForBusiness )
				: data,
	} );
