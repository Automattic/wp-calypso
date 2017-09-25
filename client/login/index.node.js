/**
 * Internal dependencies
 */
import webRouter from './index.web';
import config from 'config';
import { makeLayout, redirectLoggedIn, setUpLocale } from 'controller';

export default router => {
	if ( config.isEnabled( 'login/wp-login' ) ) {
		router(
			'/log-in/en', ( { res } ) => {
				res.redirect( 301, '/log-in' );
			}
		);
	}

	if ( config.isEnabled( 'login/magic-login' ) ) {
		// Only do the basics for layout on the server-side
		router(
			'/log-in/link/use/:lang?',
			setUpLocale,
			redirectLoggedIn,
			makeLayout,
		);
	}

	webRouter( router );
};
