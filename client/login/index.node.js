/** @format */

/**
 * Internal dependencies
 */

import config from 'config';
import webRouter from './index.web';
import { lang } from './controller';
import { makeLayout, redirectLoggedIn, setUpLocale } from 'controller';

export default router => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		// Only do the basics for layout on the server-side
		router( `/log-in/link/use/${ lang }`, setUpLocale, redirectLoggedIn, makeLayout );
	}

	webRouter( router );
};
