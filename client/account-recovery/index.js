/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { lostPassword, forgotUsername } from './controller';
import { makeLayout, redirectLoggedIn } from 'controller';

export default function( router ) {
	if ( config.isEnabled( 'account-recovery' ) ) {
		router( '/account-recovery', redirectLoggedIn, lostPassword, makeLayout );
		router( '/account-recovery/forgot-username', redirectLoggedIn, forgotUsername, makeLayout );
	}
}
