/** @format */

/**
 * External dependencies
 */

import config from 'config';

/**
 * Internal dependencies
 */
import { lostPassword, forgotUsername, validateResetCode } from './controller';
import { makeLayout, redirectLoggedIn } from 'client/controller';

export default function( router ) {
	if ( config.isEnabled( 'account-recovery' ) ) {
		router( '/account-recovery', redirectLoggedIn, lostPassword, makeLayout );
		router( '/account-recovery/forgot-username', redirectLoggedIn, forgotUsername, makeLayout );
		router(
			'/account-recovery/validate-reset-code',
			redirectLoggedIn,
			validateResetCode,
			makeLayout
		);
	}
}
