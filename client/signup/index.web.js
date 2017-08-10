/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default function() {
	page(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start
	);
}
