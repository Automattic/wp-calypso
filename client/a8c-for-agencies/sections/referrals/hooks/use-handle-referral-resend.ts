import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useResendReferralEmailMutation from 'calypso/a8c-for-agencies/data/referrals/use-resend-referral-email';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { ReferralAPIResponse } from '../types';

export default function useHandleReferralResend() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: resendReferralEmail, isPending } = useResendReferralEmailMutation();

	const handleResendReferralEmail = useCallback(
		( referral: ReferralAPIResponse, callback?: () => void ) => {
			resendReferralEmail(
				{ id: referral.id },
				{
					onSuccess: () => {
						dispatch(
							successNotice( translate( 'The referral email has been sent.' ), {
								id: 'resend-referral-email-success',
								duration: 5000,
							} )
						);
						callback?.();
					},

					onError: ( error ) => {
						dispatch(
							errorNotice( error.message, {
								id: 'resend-referral-email-error',
								duration: 5000,
							} )
						);
						callback?.();
					},
				}
			);
		},
		[ resendReferralEmail, dispatch, translate ]
	);

	return {
		handleResendReferralEmail,
		isPending,
	};
}
