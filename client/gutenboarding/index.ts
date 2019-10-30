/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { main, redirectIfNotEnabled } from './controller';
import { render as clientRender } from 'controller';
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
		main,
		// No `makeLayout` here, to avoid rendering the `Layout` component (which includes the masterbar)
		clientRender
	);
}
