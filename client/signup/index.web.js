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
		/**
		 * Adds classes to the root based on url
		 */
		controller.redirectTests,
		/**
		 * Caches the first context object
		 */
		controller.saveInitialContext,
		/**
		 * Redirect to a signup flow incase already logged in
		 */
		controller.redirectWithoutLocaleIfLoggedIn,
		/**
		 * - Tries to resume a previous signup flow it the flow is user,
		 * - Saves the current flow
		 * - Saves locale and tries to resume with saved locale
		 */
		controller.redirectToFlow,
		controller.setSelectedSiteForSignup,
		controller.start,
		makeLayout,
		clientRender
	);
}
