import { archiveReferral } from '@automattic/api-core';
import { archiveReferralInList, referralsQuery } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { ReferralAPIResponse } from '../types';
import type { Referral } from '@automattic/api-core';

export default function useHandleReferralArchive() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	// The classic A4A app runs on Calypso's QueryClient rather than the
	// api-queries singleton, so the optimistic update and invalidation go
	// through the context client instead of `archiveReferralMutation`.
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;
	const queryKey = referralsQuery( agencyId ).queryKey;

	const { mutate: archiveReferralMutate, isPending } = useMutation( {
		mutationFn: ( referralId: number ) => archiveReferral( agencyId, referralId ),
		onMutate: async ( referralId: number ) => {
			await queryClient.cancelQueries( { queryKey } );
			const previousReferrals = queryClient.getQueryData< Referral[] >( queryKey );
			if ( previousReferrals ) {
				queryClient.setQueryData(
					queryKey,
					archiveReferralInList( previousReferrals, referralId )
				);
			}
			return { previousReferrals };
		},
		onError: ( _error, _referralId, context ) => {
			if ( context?.previousReferrals ) {
				queryClient.setQueryData( queryKey, context.previousReferrals );
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey } );
		},
	} );

	const handleArchiveReferral = useCallback(
		( referral: ReferralAPIResponse, callback?: ( isSuccess: boolean ) => void ) => {
			archiveReferralMutate( referral.id, {
				onSuccess: () => {
					dispatch(
						successNotice( translate( 'The referral has been archived.' ), {
							id: 'archive-referral-success',
							duration: 5000,
						} )
					);
					callback?.( true );
				},

				onError: ( error ) => {
					dispatch(
						errorNotice( error.message, {
							id: 'archive-referral-error',
							duration: 5000,
						} )
					);
					callback?.( false );
				},
			} );
		},
		[ archiveReferralMutate, dispatch, translate ]
	);

	return {
		handleArchiveReferral,
		isPending,
	};
}
