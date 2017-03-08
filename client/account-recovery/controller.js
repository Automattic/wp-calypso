/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import LostPasswordPage from 'account-recovery/lost-password';
import ForgotUsernamePage from 'account-recovery/forgot-username';
import ResetPasswordPage from 'account-recovery/reset-password';
import ResetPasswordForm from 'account-recovery/reset-password/reset-password-form';
import ResetPasswordSmsForm from 'account-recovery/reset-password/reset-password-sms-form';
import TransactionIdForm from 'account-recovery/reset-password/transaction-id-form';
import { getCurrentUser } from 'state/current-user/selectors';

export function lostPassword( context, next ) {
	context.primary = <LostPasswordPage basePath={ context.path } />;
	next();
}

export function forgotUsername( context, next ) {
	context.primary = <ForgotUsernamePage basePath={ context.path } />;
	next();
}

export function resetPassword( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<ResetPasswordForm />
		</ResetPasswordPage>
	);

	next();
}

export function resetPasswordSmsForm( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<ResetPasswordSmsForm />
		</ResetPasswordPage>
	);

	next();
}

export function resetPasswordByTransactionId( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<TransactionIdForm />
		</ResetPasswordPage>
	);

	next();
}

export function redirectLoggedIn( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( currentUser ) {
		page.redirect( '/' );
		return;
	}

	next();
}
