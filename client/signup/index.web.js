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
import { loadExperimentAssignment } from 'calypso/lib/explat';

export default function () {
	const lang = getLanguageRouteParam();

	// Temporary Experiment testing the new ExPlat client
	loadExperimentAssignment( 'explat_test_aa_calypso_signup' );

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
