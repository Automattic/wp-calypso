import { useTranslate } from 'i18n-calypso';
import {
	ResendEmailVerificationBody,
	useSendEmailVerification,
} from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { useDispatch } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

export function useResendEmailVerification(
	body: ResendEmailVerificationBody
): () => Promise< void > {
	const resendEmailNotice = 'resend-verification-email';
	const dispatch = useDispatch();
	const resendEmail = useSendEmailVerification( body );
	const translate = useTranslate();

	return async () => {
		try {
			const result = await resendEmail();
			if ( result.success ) {
				dispatch(
					successNotice( translate( 'Verification email resent. Please check your inbox.' ), {
						id: resendEmailNotice,
						duration: 4000,
					} )
				);
				return;
			}
		} catch ( Error ) {
			dispatch(
				errorNotice( translate( "Couldn't resend verification email. Please try again." ), {
					id: resendEmailNotice,
				} )
			);
		}
	};
}
