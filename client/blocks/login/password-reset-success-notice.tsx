import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/dashboard/components/notice';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Show a password reset confirmation notice
 */
export default function PasswordResetSuccessNotice() {
	const translate = useTranslate();
	const currentQuery = useSelector( getCurrentQueryArguments );

	if ( currentQuery?.password_reset !== 'success' ) {
		return null;
	}

	return (
		<Notice variant="success">{ translate( 'Your password has been reset successfully.' ) }</Notice>
	);
}
