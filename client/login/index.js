/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { login } from './controller';
import redirectLoggedIn from 'lib/controller/redirectLoggedIn';

export default () => {
	if ( config.isEnabled( 'wp-login' ) ) {
		page( '/login', redirectLoggedIn, login );
	}
};
