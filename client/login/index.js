/**
 * Internal dependencies
 */
import config from 'config';
import { login, magicLogin } from './controller';
import { makeLayout, redirectLoggedIn } from 'controller';

export default router => {
	if ( config.isEnabled( 'magic-login' ) ) {
		router( '/log-in/link', redirectLoggedIn, magicLogin, makeLayout );
	}

	if ( config.isEnabled( 'wp-login' ) ) {
		router( '/log-in/:twoFactorAuthType?', redirectLoggedIn, login, makeLayout );
	}
};
