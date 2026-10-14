import {
	fetchPaymentMethodTaxInfo,
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

/**
 * Prefix shared by every `/me/payment-methods` query, so that a mutation can
 * invalidate the list and the per-method tax location together.
 */
export const userPaymentMethodsQueryKey = [ 'me', 'payment-methods' ];

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
		queryKey: [ ...userPaymentMethodsQueryKey, type, expired ],
		queryFn: () => fetchUserPaymentMethods( type, expired ),
		select: ( data ) =>
			Array.isArray( data ) && isForBusiness
				? data.filter( ( method ) => method?.tax_location?.is_for_business === isForBusiness )
				: data,
	} );

export const userPaymentMethodTaxInfoQuery = ( paymentMethodId: string ) =>
	queryOptions( {
		queryKey: [ ...userPaymentMethodsQueryKey, paymentMethodId, 'tax-location' ],
		queryFn: () => fetchPaymentMethodTaxInfo( paymentMethodId ),
	} );

export const userPaymentMethodSetBackupMutation = () =>
	mutationOptions( {
		meta: { statId: 'payment-method-backup-toggle' },
		mutationFn: ( data: Pick< StoredPaymentMethod, 'stored_details_id' | 'is_backup' > ) =>
			setPaymentMethodBackup( data.stored_details_id, data.is_backup ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: userPaymentMethodsQueryKey,
			} );
		},
	} );

export const userPaymentMethodDeleteMutation = () =>
	mutationOptions( {
		meta: { statId: 'payment-method-delete' },
		mutationFn: ( paymentMethodId: string ) => requestPaymentMethodDeletion( paymentMethodId ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: userPaymentMethodsQueryKey,
			} );
		},
	} );

export const userPaymentMethodSetTaxInfoMutation = () =>
	mutationOptions( {
		meta: { statId: 'payment-method-tax-update' },
		mutationFn: ( data: Pick< StoredPaymentMethod, 'stored_details_id' | 'tax_location' > ) =>
			setPaymentMethodTaxInfo( data.stored_details_id, data.tax_location ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: userPaymentMethodsQueryKey,
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
		meta: { statId: 'credit-card-save' },
		mutationFn: ( params: SaveCreditCardParams ) => saveCreditCard( params ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: userPaymentMethodsQueryKey,
			} );
		},
	} );

export const updateCreditCardMutation = () =>
	mutationOptions( {
		meta: { statId: 'credit-card-update' },
		mutationFn: ( params: UpdateCreditCardParams ) => updateCreditCard( params ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: userPaymentMethodsQueryKey,
			} );
		},
	} );
