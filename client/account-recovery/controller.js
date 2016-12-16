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
import { getCurrentUser } from 'state/current-user/selectors';

export function lostPassword( context, next ) {
	context.primary = <LostPasswordPage basePath={ context.path } />;
	next();
}

export function forgotUsername( context, next ) {
	context.primary = <ForgotUsernamePage basePath={ context.path } />;
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
