/**
 * Internal dependencies
 */
import config from 'config';
import { login } from './controller';
import { makeLayout, redirectLoggedIn } from 'controller';

export default router => {
	if ( config.isEnabled( 'wp-login' ) ) {
		router( '/me/login/:twoFactorAuthType?', redirectLoggedIn, login, makeLayout );
	}
};
