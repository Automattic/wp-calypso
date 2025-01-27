import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useArchiveReferralMutation from 'calypso/a8c-for-agencies/data/referrals/use-archive-referral';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { Referral } from '../types';

export default function useHandleReferralArchive() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { mutate: archiveReferral } = useArchiveReferralMutation();

	return useCallback(
		( referral: Referral, callback?: ( isSuccess: boolean ) => void ) => {
			archiveReferral(
				{ id: referral.referralId },
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
}
