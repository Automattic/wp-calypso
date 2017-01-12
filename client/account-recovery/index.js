/**
 * Internal dependencies
 */
import {
	lostPassword,
	forgotUsername,
	resetPassword,
	resetPasswordByTransactionId,
	resetPasswordByActivationKey,
	resetPasswordByTwoFactorCode,
	resetPasswordByContactEmail,
	redirectLoggedIn
} from './controller';

export default function( router ) {
	// Main route for account recovery is the lost password page
	router( '/account-recovery', redirectLoggedIn, lostPassword );
	router( '/account-recovery/forgot-username', redirectLoggedIn, forgotUsername );
	router( '/account-recovery/reset-password', redirectLoggedIn, resetPassword );
	router( '/account-recovery/reset-password/transaction-id', redirectLoggedIn, resetPasswordByTransactionId );
	router( '/account-recovery/reset-password/activation-key', redirectLoggedIn, resetPasswordByActivationKey );
	router( '/account-recovery/reset-password/two-factor', redirectLoggedIn, resetPasswordByTwoFactorCode );
	router( '/account-recovery/reset-password/email', redirectLoggedIn, resetPasswordByContactEmail );
}
