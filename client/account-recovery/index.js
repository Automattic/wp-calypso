/**
 * Internal dependencies
 */
import {
	lostPassword,
	forgotUsername,
	resetPassword,
	resetPasswordSmsForm,
	resetPasswordEmailForm,
	resetPasswordByTransactionId,
	resetPasswordConfirmForm,
	redirectLoggedIn
} from './controller';
import config from 'config';

import { ACCOUNT_RECOVERY_ROUTES } from 'state/account-recovery/reset/constants';

export default function( router ) {
	// Main route for account recovery is the lost password page
	if ( config.isEnabled( 'account-recovery' ) ) {
		router( ACCOUNT_RECOVERY_ROUTES.ROOT, redirectLoggedIn, lostPassword );
		router( ACCOUNT_RECOVERY_ROUTES.FORGOT_USERNAME, redirectLoggedIn, forgotUsername );
		router( ACCOUNT_RECOVERY_ROUTES.RESET_PASSWORD, redirectLoggedIn, resetPassword );
		router( ACCOUNT_RECOVERY_ROUTES.RESET_PASSWORD_EMAIL_FORM, redirectLoggedIn, resetPasswordEmailForm );
		router( ACCOUNT_RECOVERY_ROUTES.RESET_PASSWORD_SMS_FORM, redirectLoggedIn, resetPasswordSmsForm );
		router( ACCOUNT_RECOVERY_ROUTES.RESET_PASSWORD_TRANSACTION_ID, redirectLoggedIn, resetPasswordByTransactionId );
		router( ACCOUNT_RECOVERY_ROUTES.RESET_PASSWORD_CONFIRM, redirectLoggedIn, resetPasswordConfirmForm );
	}
}
