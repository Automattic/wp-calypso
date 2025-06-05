import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import wp from 'calypso/lib/wp';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import type { ComponentType } from 'react';

export const storedPaymentMethodsQueryKey = 'use-stored-payment-methods';

export type PaymentMethodRequestType = 'card' | 'agreement' | 'all';

const fetchPaymentMethods = (
	type: PaymentMethodRequestType,
	expired: boolean
): StoredPaymentMethod[] =>
	wp.req.get( '/me/payment-methods', {
		type,
		expired: expired ? 'include' : 'exclude',
		apiVersion: '1.2',
	} );

const requestPaymentMethodDeletion = ( id: StoredPaymentMethod[ 'stored_details_id' ] ) =>
	wp.req.post( { path: '/me/stored-cards/' + id + '/delete' } );

export interface StoredPaymentMethodsState {
	paymentMethods: StoredPaymentMethod[];
	isLoading: boolean;
	isDeleting: boolean;
	error: string | null;
	deletePaymentMethod: ( id: StoredPaymentMethod[ 'stored_details_id' ] ) => Promise< void >;
}

export interface WithStoredPaymentMethodsProps {
	paymentMethodsState: StoredPaymentMethodsState;
}

export function withStoredPaymentMethods< P >(
	Component: ComponentType< P >,
	options: {
		type?: PaymentMethodRequestType;
		expired?: boolean;
	} = {}
) {
	return function StoredPaymentMethodsWrapper(
		props: Omit< P, keyof WithStoredPaymentMethodsProps >
	) {
		const paymentMethodsState = useStoredPaymentMethods( options );
		return <Component { ...( props as P ) } paymentMethodsState={ paymentMethodsState } />;
	};
}

export function useStoredPaymentMethods( {
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
} = {} ): StoredPaymentMethodsState {
	const queryClient = useQueryClient();

	const queryKey = [ storedPaymentMethodsQueryKey, type, expired ];

	const { data, isLoading, error } = useQuery< StoredPaymentMethod[], Error >( {
		queryKey,
		queryFn: () => fetchPaymentMethods( type, expired ),
		enabled: ! isLoggedOut,
	} );

	const translate = useTranslate();
	const isDataValid = Array.isArray( data );
	const filteredPaymentMethods = useMemo( () => {
		if ( ! isDataValid ) {
			return [];
		}

		return isForBusiness
			? data.filter( ( method ) => method?.tax_location?.is_for_business === isForBusiness )
			: data;
	}, [ isForBusiness, data, isDataValid ] );

	const mutation = useMutation<
		StoredPaymentMethod[ 'stored_details_id' ],
		Error,
		StoredPaymentMethod[ 'stored_details_id' ]
	>( {
		mutationFn: ( id ) => requestPaymentMethodDeletion( id ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ storedPaymentMethodsQueryKey ],
			} );
		},
	} );

	const deletePaymentMethod = useCallback< StoredPaymentMethodsState[ 'deletePaymentMethod' ] >(
		( id ) => {
			return new Promise( ( resolve, reject ) => {
				mutation.mutate( id, {
					onSuccess: () => resolve(),
					onError: ( error ) => reject( error ),
				} );
			} );
		},
		[ mutation ]
	);

	const errorMessage = ( () => {
		if ( mutation.error ) {
			return mutation.error.message;
		}
		if ( error ) {
			return error.message;
		}
		if ( data !== undefined && ! isDataValid ) {
			return translate( 'There was a problem loading your stored payment methods.', {
				textOnly: true,
			} );
		}
		return null;
	} )();

	return {
		paymentMethods: filteredPaymentMethods,
		isLoading: isLoggedOut ? false : isLoading,
		isDeleting: mutation.isPending,
		error: errorMessage,
		deletePaymentMethod,
	};
}
