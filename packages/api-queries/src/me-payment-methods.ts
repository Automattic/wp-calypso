import {
	fetchUserPaymentMethods,
	setPaymentMethodBackup,
	requestPaymentMethodDeletion,
	setPaymentMethodTaxInfo,
	fetchAllowedPaymentMethods,
	saveCreditCard,
	updateCreditCard,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type {
	PaymentMethodRequestType,
	StoredPaymentMethod,
	SaveCreditCardParams,
	UpdateCreditCardParams,
} from '@automattic/api-core';

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

export const userPaymentMethodSetBackupQuery = () =>
	mutationOptions( {
		mutationFn: ( data: Pick< StoredPaymentMethod, 'stored_details_id' | 'is_backup' > ) =>
			setPaymentMethodBackup( data.stored_details_id, data.is_backup ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'me', 'payment-methods' ],
			} );
		},
	} );

export const userPaymentMethodDeleteQuery = () =>
	mutationOptions( {
		mutationFn: ( paymentMethodId: string ) => requestPaymentMethodDeletion( paymentMethodId ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'me', 'payment-methods' ],
			} );
		},
	} );

export const userPaymentMethodSetTaxInfoQuery = () =>
	mutationOptions( {
		mutationFn: ( data: Pick< StoredPaymentMethod, 'stored_details_id' | 'tax_location' > ) =>
			setPaymentMethodTaxInfo( data.stored_details_id, data.tax_location ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'me', 'payment-methods' ],
			} );
		},
	} );

export const allowedPaymentMethodsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'allowed-payment-methods' ],
		queryFn: fetchAllowedPaymentMethods,
	} );

export const saveCreditCardMutation = () =>
	mutationOptions( {
		mutationFn: ( params: SaveCreditCardParams ) => saveCreditCard( params ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'me', 'payment-methods' ],
			} );
		},
	} );

export const updateCreditCardMutation = () =>
	mutationOptions( {
		mutationFn: ( params: UpdateCreditCardParams ) => updateCreditCard( params ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'me', 'payment-methods' ],
			} );
		},
	} );
