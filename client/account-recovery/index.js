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

import { ACCOUNT_RECOVERY_ROUTES as ROUTES } from './constants';

export default function( router ) {
	// Main route for account recovery is the lost password page
	if ( config.isEnabled( 'account-recovery' ) ) {
		router( ROUTES.ROOT, redirectLoggedIn, lostPassword( ROUTES.RESET_PASSWORD ) );
		router( ROUTES.FORGOT_USERNAME, redirectLoggedIn, forgotUsername );
		router( ROUTES.RESET_PASSWORD, redirectLoggedIn, resetPassword );
		router( ROUTES.RESET_PASSWORD_EMAIL_FORM, redirectLoggedIn, resetPasswordEmailForm );
		router( ROUTES.RESET_PASSWORD_SMS_FORM, redirectLoggedIn, resetPasswordSmsForm );
		router( ROUTES.RESET_PASSWORD_TRANSACTION_ID, redirectLoggedIn, resetPasswordByTransactionId );
		router( ROUTES.RESET_PASSWORD_CONFIRM, redirectLoggedIn, resetPasswordConfirmForm );
	}
}
