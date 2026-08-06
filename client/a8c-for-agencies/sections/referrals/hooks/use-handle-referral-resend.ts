import { resendReferralEmailMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { ReferralAPIResponse } from '../types';

export default function useHandleReferralResend() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;

	const { mutate: resendReferralEmail, isPending } = useMutation(
		resendReferralEmailMutation( agencyId )
	);

	const handleResendReferralEmail = useCallback(
		( referral: ReferralAPIResponse, callback?: () => void ) => {
			resendReferralEmail( referral.id, {
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
			} );
		},
		[ resendReferralEmail, dispatch, translate ]
	);

	return {
		handleResendReferralEmail,
		isPending,
	};
}
