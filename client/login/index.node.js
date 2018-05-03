/** @format */

/**
 * Internal dependencies
 */

import config from 'config';
import webRouter from './index.web';
import { makeLayout, redirectLoggedIn, setUpLocale } from 'controller';
import { langRouteParams } from 'controller/shared';

export default router => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		// Only do the basics for layout on the server-side
		router( `/log-in/link/use/${ langRouteParams }`, setUpLocale, redirectLoggedIn, makeLayout );
	}

	webRouter( router );
};
