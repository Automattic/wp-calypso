import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import { PerformanceProfilerDashboardContext } from './controller';
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

	router(
		[ `/${ lang }/speed-test-tool(/*)?` ],
		ssrSetupLocale,
		PerformanceProfilerDashboardContext,
		makeLayout
	);
};
