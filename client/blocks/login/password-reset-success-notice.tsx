import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
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
		<Notice status="success" isDismissible={ false }>
			{ translate( 'Your password has been reset successfully.' ) }
		</Notice>
	);
}
