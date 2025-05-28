import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useArchiveReferralMutation from 'calypso/a8c-for-agencies/data/referrals/use-archive-referral';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { ReferralAPIResponse } from '../types';
import { getReferralsQueryKey } from './use-fetch-referrals';

export default function useHandleReferralArchive() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	// Referrals query key so we optimistically update the referrals list
	const agencyId = useSelector( getActiveAgencyId );
	const referralsQueryKey = getReferralsQueryKey( agencyId );

	const { mutate: archiveReferral, isPending } = useArchiveReferralMutation( {
		// Optimistically update the referrals list
		onMutate: async ( { id }: { id: number } ) => {
			// Cancel any current refetches, so they don't overwrite our optimistic update
			await queryClient.cancelQueries( {
				queryKey: referralsQueryKey,
			} );
			// Snapshot the previous value
			const previousReferrals = queryClient.getQueryData( referralsQueryKey );
			// Optimistically update to the new value
			queryClient.setQueryData( referralsQueryKey, ( oldReferrals: any ) => {
				return oldReferrals.map( ( referral: ReferralAPIResponse ) => {
					if ( referral.id === id ) {
						return {
							...referral,
							status: 'archived',
						};
					}
					return referral;
				} );
			} );
			// Store previous settings in case of failure
			return { previousReferrals };
		},
		onSettled: () => {
			queryClient.invalidateQueries( {
				queryKey: referralsQueryKey,
			} );
		},
	} );

	const handleArchiveReferral = useCallback(
		( referral: ReferralAPIResponse, callback?: ( isSuccess: boolean ) => void ) => {
			archiveReferral(
				{ id: referral.id },
				{
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
				}
			);
		},
		[ archiveReferral, dispatch, translate ]
	);

	return {
		handleArchiveReferral,
		isPending,
	};
}
