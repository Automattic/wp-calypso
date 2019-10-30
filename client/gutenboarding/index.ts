/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { hideMasterbar, main, redirectIfNotEnabled } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { wpDataDebugMiddleware } from './devtools';

export const GUTENBOARDING_SECTION_DEFINITION = {
	name: 'gutenboarding',
	paths: [ '/gutenboarding' ],
	module: 'gutenboarding',
	secondary: false,
	group: 'sites',
	enableLoggedOut: true,
};

export default function() {
	page(
		'/gutenboarding',
		redirectIfNotEnabled,
		wpDataDebugMiddleware,
		hideMasterbar,
		main,
		makeLayout,
		clientRender
	);
}
