import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Confirms a finished password reset.
 *
 * The WordPress.com reset-password screen no longer renders its own confirmation
 * page: it redirects to the login page with `password_reset=success` instead.
 */
export default function PasswordResetSuccessNotice() {
	const translate = useTranslate();
	const currentQuery = useSelector( getCurrentQueryArguments );

	if ( currentQuery?.password_reset !== 'success' ) {
		return null;
	}

	return (
		<Notice status="is-success" showDismiss={ false }>
			{ translate( 'Your password has been reset.' ) }
		</Notice>
	);
}
