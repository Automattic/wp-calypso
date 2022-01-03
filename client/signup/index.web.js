import page from 'page';
import { makeLayout, render as clientRender, setLocaleMiddleware } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import controller from './controller';

export default function () {
	const lang = getLanguageRouteParam();

	page(
		[
			`/start/${ lang }`,
			`/start/:flowName/${ lang }`,
			`/start/:flowName/:stepName/${ lang }`,
			`/start/:flowName/:stepName/:stepSectionName/${ lang }`,
		],
		controller.redirectWithoutLocaleIfLoggedIn,
		setLocaleMiddleware(),
		controller.redirectTests,
		controller.saveInitialContext,
		controller.redirectToFlow,
		controller.setSelectedSiteForSignup,
		controller.start,
		controller.importSiteInfoFromQuery,
		makeLayout,
		clientRender
	);
}
