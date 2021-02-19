/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import webRouter from './index.web';
import { makeLayout, setLocaleMiddleware } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import redirectLoggedIn from './redirect-logged-in';

/**
 * Re-exports
 */
export { LOGIN_SECTION_DEFINITION } from './index.web';

export default ( router ) => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		const lang = getLanguageRouteParam();

		// Only do the basics for layout on the server-side
		router( `/log-in/link/use/${ lang }`, setLocaleMiddleware, redirectLoggedIn, makeLayout );
	}

	webRouter( router );
};
