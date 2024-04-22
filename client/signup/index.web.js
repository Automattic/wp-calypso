import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
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
		controller.redirectTests,
		controller.saveInitialContext,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.redirectWooPasswordless,
		controller.setSelectedSiteForSignup,
		controller.start,
		makeLayout,
		clientRender
	);
}
