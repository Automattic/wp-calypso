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
