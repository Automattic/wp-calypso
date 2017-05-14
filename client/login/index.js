/**
 * Internal dependencies
 */
import config from 'config';
import { login, magicLogin } from './controller';
import { makeLayout, redirectLoggedIn } from 'controller';

export default router => {
	if ( config.isEnabled( 'magic-login' ) ) {
		router( '/login/link', redirectLoggedIn, magicLogin, makeLayout );
	}

	if ( config.isEnabled( 'wp-login' ) ) {
		router( '/login/:twoFactorAuthType?', redirectLoggedIn, login, makeLayout );
	}
};
