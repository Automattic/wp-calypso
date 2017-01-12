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
import TransactionIdForm from 'account-recovery/reset-password/transaction-id-form';
import TwoFactorCodeForm from 'account-recovery/reset-password/two-factor-code-form';
import ActivationKeyForm from 'account-recovery/reset-password/activation-key-form';
import ContactForm from 'account-recovery/reset-password/contact-form';
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

export function resetPasswordByTransactionId( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<TransactionIdForm />
		</ResetPasswordPage>
	);

	next();
}

export function resetPasswordByActivationKey( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<ActivationKeyForm />
		</ResetPasswordPage>
	);

	next();
}

export function resetPasswordByTwoFactorCode( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<TwoFactorCodeForm />
		</ResetPasswordPage>
	);

	next();
}

export function resetPasswordByContactEmail( context, next ) {
	context.primary = (
		<ResetPasswordPage basePath={ context.path }>
			<ContactForm />
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
