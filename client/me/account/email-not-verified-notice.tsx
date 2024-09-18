import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { useResendEmailVerification } from '../../landing/stepper/hooks/use-resend-email-verification';
import './email-not-verified-notice.scss';

// TODO REMOVE THIS FILE.
const EmailNotVerifiedNotice = () => {
	const translate = useTranslate();
	const resendEmailVerification = useResendEmailVerification();
	const isVerified = useSelector( isCurrentUserEmailVerified );

	if ( isVerified ) {
		return null;
	}

	return (
		<Notice
			className="email-not-verified-notice"
			showDismiss={ false }
			status="is-warning"
			text={ translate( 'Your email has not been verified yet. ' ) }
		>
			<NoticeAction onClick={ resendEmailVerification }>
				{ translate( 'Resend email' ) }
			</NoticeAction>
		</Notice>
	);
};

export default EmailNotVerifiedNotice;
