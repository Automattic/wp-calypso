import { getLanguageRouteParam } from '@automattic/i18n-utils';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
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
		controller.indicateStartSignupStateChanges,
		controller.redirectTests,
		controller.saveInitialContext,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.setSelectedSiteForSignup,
		controller.start,
		controller.importSiteInfoFromQuery,
		controller.indicateEndSignupStateChanges,
		makeLayout,
		clientRender
	);
}
