import { requestPaymentMethodDeletion } from '@automattic/api-core';
import { userPaymentMethodsQuery, userPaymentMethodsQueryKey } from '@automattic/api-queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import type { PaymentMethodRequestType, StoredPaymentMethod } from '@automattic/api-core';
import type { ComponentType } from 'react';

export type { PaymentMethodRequestType };

// Stable reference so consumers can safely use the result in dependency arrays.
const NO_PAYMENT_METHODS: StoredPaymentMethod[] = [];

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

	const { data, isLoading, error } = useQuery( {
		...userPaymentMethodsQuery( { type, expired, isForBusiness } ),
		enabled: ! isLoggedOut,
	} );

	const translate = useTranslate();
	const isDataValid = Array.isArray( data );

	const {
		mutate: deleteMutate,
		isPending: isDeleting,
		error: deleteError,
	} = useMutation<
		StoredPaymentMethod[ 'stored_details_id' ],
		Error,
		StoredPaymentMethod[ 'stored_details_id' ]
	>( {
		mutationFn: ( id ) => requestPaymentMethodDeletion( id ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: userPaymentMethodsQueryKey,
			} );
		},
	} );

	const deletePaymentMethod = useCallback< StoredPaymentMethodsState[ 'deletePaymentMethod' ] >(
		( id ) => {
			return new Promise( ( resolve, reject ) => {
				deleteMutate( id, {
					onSuccess: () => resolve(),
					onError: ( error ) => reject( error ),
				} );
			} );
		},
		[ deleteMutate ]
	);

	const errorMessage = ( () => {
		if ( deleteError ) {
			return deleteError.message;
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
		paymentMethods: isDataValid ? data : NO_PAYMENT_METHODS,
		isLoading: isLoggedOut ? false : isLoading,
		isDeleting,
		error: errorMessage,
		deletePaymentMethod,
	};
}
