import { __ } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useSendEmailVerification } from '../../landing/stepper/hooks/use-send-email-verification';
import './email-not-verified-notice.scss';
import { isCurrentUserEmailVerified } from '../../state/current-user/selectors';

const resendEmailNotice = 'resend-verification-email';

const EmailNotVerifiedNotice = () => {
	const dispatch = useDispatch();
	const resendEmail = useSendEmailVerification();
	const isVerified = useSelector( isCurrentUserEmailVerified );

	if ( isVerified ) {
		return null;
	}

	const handleResend = async () => {
		try {
			const result = await resendEmail();
			if ( result.success ) {
				dispatch(
					successNotice( __( 'Verification email resent. Please check your inbox.' ), {
						id: resendEmailNotice,
						duration: 4000,
					} )
				);
				return;
			}
		} catch ( Error ) {}
		dispatch(
			errorNotice( __( "Couldn't resend verification email. Please try again." ), {
				id: resendEmailNotice,
			} )
		);
	};

	return (
		<Notice
			className="email-not-verified-notice"
			showDismiss={ false }
			status="is-warning"
			text={ __( 'Your email has not been verified yet. ' ) }
		>
			<NoticeAction onClick={ handleResend }>{ __( 'Resend email' ) }</NoticeAction>
		</Notice>
	);
};

export default EmailNotVerifiedNotice;
