import { userPaymentMethodsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import type { PaymentMethodRequestType, StoredPaymentMethod } from '@automattic/api-core';

export type { PaymentMethodRequestType };

// Stable reference so consumers can safely use the result in dependency arrays.
const NO_PAYMENT_METHODS: StoredPaymentMethod[] = [];

export interface StoredPaymentMethodsState {
	paymentMethods: StoredPaymentMethod[];
	isLoading: boolean;
	error: string | null;
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
	const { data, isLoading, error } = useQuery( {
		...userPaymentMethodsQuery( { type, expired, isForBusiness } ),
		enabled: ! isLoggedOut,
	} );

	const translate = useTranslate();
	const isDataValid = Array.isArray( data );

	const errorMessage = ( () => {
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
		error: errorMessage,
	};
}
