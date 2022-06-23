import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useSendEmailVerification } from '../../landing/stepper/hooks/use-send-email-verification';
import { isEmailVerified } from '../../state/selectors/is-email-verified';
import './email-not-verified-notice.scss';

const resendEmailNotice = 'resend-verification-email';

const EmailNotVerifiedNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const resendEmail = useSendEmailVerification();
	const isVerified = useSelector( isEmailVerified );

	if ( isVerified ) {
		return null;
	}

	const handleResend = async () => {
		try {
			const result = await resendEmail();
			if ( result.success ) {
				dispatch(
					successNotice( translate( 'The verification email has been sent.' ), {
						id: resendEmailNotice,
						duration: 4000,
					} )
				);
				return;
			}
		} catch ( Error ) {}
		dispatch(
			errorNotice( translate( 'There was an error processing your request.' ), {
				id: resendEmailNotice,
			} )
		);
	};

	return (
		<Notice
			className="email-not-verified-notice"
			showDismiss={ false }
			status="is-warning"
			text={ 'Your email has not been verified yet. ' }
		>
			<NoticeAction onClick={ handleResend }>{ translate( 'Resend email' ) }</NoticeAction>
		</Notice>
	);
};

export default EmailNotVerifiedNotice;
