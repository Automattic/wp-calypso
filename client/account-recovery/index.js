/**
 * Internal dependencies
 */
import config from 'config';
import {
	lostPassword,
	forgotUsername,
	resetPassword,
	resetPasswordSmsForm,
	resetPasswordEmailForm,
	resetPasswordByTransactionId,
	resetPasswordConfirmForm
} from './controller';
import { makeLayout, redirectLoggedIn } from 'controller';

export default function( router ) {
	// Main route for account recovery is the lost password page
	if ( config.isEnabled( 'account-recovery' ) ) {
		router( '/account-recovery', redirectLoggedIn, lostPassword, makeLayout );
		router( '/account-recovery/forgot-username', redirectLoggedIn, forgotUsername, makeLayout );
		router( '/account-recovery/reset-password', redirectLoggedIn, resetPassword, makeLayout );
		router( '/account-recovery/reset-password/sms-form', redirectLoggedIn, resetPasswordSmsForm, makeLayout );
		router( '/account-recovery/reset-password/email-form', redirectLoggedIn, resetPasswordEmailForm, makeLayout );
		router( '/account-recovery/reset-password/transaction-id', redirectLoggedIn, resetPasswordByTransactionId, makeLayout );
		router( '/account-recovery/reset-password/confirm', redirectLoggedIn, resetPasswordConfirmForm, makeLayout );
	}
}
