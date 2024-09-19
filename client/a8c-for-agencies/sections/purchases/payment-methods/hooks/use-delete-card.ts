import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { isClientView } from '../lib/is-client-view';
import { getFetchStoredCardsKey } from './use-stored-cards';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

const NOTIFICATION_DURATION = 3000;

interface APIResponse {
	success: boolean;
}

interface DeleteCardProps {
	paymentMethodId: string;
	primaryPaymentMethodId?: string;
}

function useDeleteCardMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, Error, DeleteCardProps, TContext >
): UseMutationResult< APIResponse, Error, DeleteCardProps, TContext > {
	const agencyId = useSelector( getActiveAgencyId );
	const isClient = isClientView();

	return useMutation< APIResponse, Error, DeleteCardProps, TContext >( {
		...options,
		mutationFn: ( { paymentMethodId, primaryPaymentMethodId } ) =>
			wpcom.req.post( {
				method: 'DELETE',
				apiNamespace: 'wpcom/v2',
				path: isClient
					? '/agency-client/stripe/payment-method'
					: '/jetpack-licensing/stripe/payment-method',
				body: {
					...( ! isClient && agencyId && { agency_id: agencyId } ),
					payment_method_id: paymentMethodId,
					primary_payment_method_id: primaryPaymentMethodId,
				},
			} ),
	} );
}

export function useDeleteCard( card: PaymentMethod, allStoredCards: PaymentMethod[] ) {
	const [ isDeleteDialogVisible, setIsDeleteDialogVisible ] = useState( false );

	const dispatch = useDispatch();
	const translate = useTranslate();

	const { mutate, isPending, isSuccess, isError, error } = useDeleteCardMutation( {
		retry: false,
	} );
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	const nextPrimaryPaymentMethod = ( allStoredCards || [] ).find(
		( currCard: PaymentMethod ) => currCard.id !== card.id
	);

	const handleDelete = useCallback( () => {
		mutate( {
			paymentMethodId: card.id,
			primaryPaymentMethodId: nextPrimaryPaymentMethod?.id,
		} );
	}, [ card.id, mutate, nextPrimaryPaymentMethod?.id ] );

	useEffect( () => {
		if ( isSuccess ) {
			queryClient.invalidateQueries( {
				queryKey: getFetchStoredCardsKey( agencyId ),
			} );
			dispatch(
				successNotice( translate( 'Payment method deleted successfully' ), {
					duration: NOTIFICATION_DURATION,
					id: 'payment-method-deleted-successfully',
				} )
			);
			setIsDeleteDialogVisible( false );
		}
	}, [ agencyId, dispatch, isSuccess, queryClient, translate ] );

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( error.message, {
					duration: NOTIFICATION_DURATION,
					id: 'payment-method-deleted-error',
				} )
			);
		}
	}, [ dispatch, error?.message, isError, translate ] );

	return {
		isDeleteDialogVisible,
		setIsDeleteDialogVisible,
		handleDelete,
		isDeleteInProgress: isPending,
	};
}
