/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';

export default async function () {
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
		controller.setSelectedSiteForSignup,
		controller.start,
		controller.importSiteInfoFromQuery,
		makeLayout,
		clientRender
	);
}
