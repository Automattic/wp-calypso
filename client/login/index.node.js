import config from '@automattic/calypso-config';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, setLocaleMiddleware } from 'calypso/controller';
import webRouter from './index.web';
import redirectLoggedIn from './redirect-logged-in';
import { setMetaTags } from './ssr';

/**
 * Re-exports
 */
export { LOGIN_SECTION_DEFINITION } from './index.web';

export default ( router ) => {
	if ( config.isEnabled( 'login/magic-login' ) ) {
		const lang = getLanguageRouteParam();

		// Only do the basics for layout on the server-side
		router(
			[ `/log-in/link/use/${ lang }`, `/log-in/link/jetpack/use/${ lang }` ],
			setLocaleMiddleware(),
			redirectLoggedIn,
			setMetaTags,
			makeLayout
		);
	}

	webRouter( router );
};
