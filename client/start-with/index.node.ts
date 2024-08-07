import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, setLocaleMiddleware } from 'calypso/controller';
import { serverRouter } from 'calypso/server/isomorphic-routing';

/**
 * Using the server routing for this section has the sole purpose of defining
 * a named route parameter for the language, that is used to set `context.lang`
 * via the `setLocaleMiddleware()`.
 *
 * The `context.lang` value is then used in the server renderer to properly
 * attach the translation files to the page.
 * @see https://github.com/Automattic/wp-calypso/blob/trunk/client/server/render/index.js#L171.
 */
export default ( router: ReturnType< typeof serverRouter > ) => {
	const lang = getLanguageRouteParam();

	router( [ `/${ lang }/start-with(/*)?` ], setLocaleMiddleware(), makeLayout );
};
