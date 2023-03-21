import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { isPaymentAgreement } from 'calypso/lib/checkout/payment-methods';
import wp from 'calypso/lib/wp';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';

export const storedPaymentMethodsQueryKey = 'use-stored-payment-methods';

export type PaymentMethodRequestType = 'card' | 'agreement' | 'all';

const fetchPaymentMethods = ( {
	type,
	expired,
}: {
	type?: PaymentMethodRequestType;
	expired?: boolean;
} ): StoredPaymentMethod[] =>
	wp.req.get(
		{ path: `/me/payment-methods?type=${ type }&expired=${ expired ? 'include' : 'exclude' }` },
		{ apiVersion: '1.1' }
	);

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

export function withStoredPaymentMethods<
	P extends WithStoredPaymentMethodsProps = WithStoredPaymentMethodsProps
>(
	Component: React.ComponentType< P >,
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
	type,
	expired,
	isLoggedOut,
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
} = {} ): StoredPaymentMethodsState {
	const queryClient = useQueryClient();

	const queryKey = [ storedPaymentMethodsQueryKey, type, expired ];

	const { data, isLoading, error } = useQuery< StoredPaymentMethod[], Error >(
		queryKey,
		() => fetchPaymentMethods( { type, expired } ),
		{
			initialData: [],
			enabled: ! isLoggedOut,
		}
	);

	const translate = useTranslate();
	const isDataValid = Array.isArray( data );
	const paymentMethods = isDataValid ? data : [];

	const mutation = useMutation<
		StoredPaymentMethod[ 'stored_details_id' ],
		Error,
		StoredPaymentMethod[ 'stored_details_id' ]
	>( ( id ) => requestPaymentMethodDeletion( id ), {
		onSuccess: () => {
			queryClient.invalidateQueries( queryKey );
		},
	} );

	const deletePaymentMethod = useCallback< StoredPaymentMethodsState[ 'deletePaymentMethod' ] >(
		( id ) => {
			return new Promise( ( resolve, reject ) => {
				mutation.mutate( id, {
					onSuccess: () => resolve(),
					onError: ( error ) => reject( error.message ),
				} );
			} );
		},
		[ mutation ]
	);

	const deletePaymentMethodAndSimilar = useCallback<
		StoredPaymentMethodsState[ 'deletePaymentMethod' ]
	>(
		async ( id ) => {
			const matchingPaymentMethod = data?.find( ( method ) => method.stored_details_id === id );
			if ( ! matchingPaymentMethod ) {
				return Promise.reject(
					translate( 'There was a problem deleting that payment method.', { textOnly: true } )
				);
			}

			if ( isPaymentAgreement( matchingPaymentMethod ) ) {
				const similarPaymentAgreements =
					data?.filter( ( method ) => method.email === matchingPaymentMethod.email ) ?? [];
				return Promise.all(
					similarPaymentAgreements.map( ( method ) =>
						deletePaymentMethod( method.stored_details_id )
					)
				).then( () => Promise.resolve() );
			}

			return deletePaymentMethod( id );
		},
		[ translate, data, deletePaymentMethod ]
	);

	const errorMessage = ( () => {
		if ( mutation.error ) {
			return mutation.error.message;
		}
		if ( error ) {
			return error.message;
		}
		if ( ! isDataValid ) {
			return translate( 'There was a problem loading your stored payment methods.', {
				textOnly: true,
			} );
		}
		return null;
	} )();

	return {
		paymentMethods,
		isLoading,
		isDeleting: mutation.isLoading,
		error: errorMessage,
		deletePaymentMethod: deletePaymentMethodAndSimilar,
	};
}
