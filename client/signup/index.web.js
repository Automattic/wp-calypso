/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		controller.saveInitialContext,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		makeLayout,
		clientRender
	);
}
