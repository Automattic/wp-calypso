import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { isClientView } from '../lib/is-client-view';
import { getFetchStoredCardsKey } from './use-stored-cards';
import type { SetAsPrimaryCardProps } from 'calypso/jetpack-cloud/sections/partner-portal/types';

const NOTIFICATION_DURATION = 3000;

interface APIResponse {
	success: boolean;
}

function useSetAsPrimaryCardMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, Error, SetAsPrimaryCardProps, TContext >
): UseMutationResult< APIResponse, Error, SetAsPrimaryCardProps, TContext > {
	const agencyId = useSelector( getActiveAgencyId );
	const isClient = isClientView();

	return useMutation< APIResponse, Error, SetAsPrimaryCardProps, TContext >( {
		...options,
		mutationFn: ( { paymentMethodId, useAsPrimaryPaymentMethod } ) =>
			wpcom.req.post( {
				apiNamespace: 'wpcom/v2',
				path: isClient
					? '/agency-client/stripe/payment-method'
					: '/jetpack-licensing/stripe/payment-method',
				body: {
					...( ! isClient && agencyId && { agency_id: agencyId } ),
					payment_method_id: paymentMethodId,
					use_as_primary_payment_method: useAsPrimaryPaymentMethod,
				},
			} ),
	} );
}

export function useSetAsPrimaryCard(): {
	setAsPrimaryCard: ( params: SetAsPrimaryCardProps ) => void;
	isSetAsPrimaryCardPending: boolean;
} {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	const { mutate, isPending, isSuccess, isError } = useSetAsPrimaryCardMutation( {
		retry: false,
	} );

	useEffect( () => {
		if ( isSuccess ) {
			queryClient.invalidateQueries( {
				queryKey: getFetchStoredCardsKey( agencyId ),
			} );
			dispatch(
				successNotice( translate( 'Card set as primary.' ), {
					duration: NOTIFICATION_DURATION,
					id: 'set-as-primary-card-success',
				} )
			);
		}
	}, [ agencyId, dispatch, isSuccess, queryClient, translate ] );

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( translate( 'Something went wrong. Please try again.' ), {
					duration: NOTIFICATION_DURATION,
					id: 'set-as-primary-card-error',
				} )
			);
		}
	}, [ dispatch, isError, translate ] );

	return {
		setAsPrimaryCard: mutate,
		isSetAsPrimaryCardPending: isPending,
	};
}
