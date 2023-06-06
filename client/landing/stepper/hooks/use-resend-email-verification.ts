import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useSendEmailVerification } from './use-send-email-verification';

export function useResendEmailVerification() {
	const resendEmailNotice = 'resend-verification-email';
	const dispatch = useDispatch();
	const resendEmail = useSendEmailVerification();
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
