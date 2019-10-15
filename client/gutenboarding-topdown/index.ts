/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { hideMasterbar, main, redirectIfNotEnabled } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
		'/gutenboarding-topdown',
		redirectIfNotEnabled,
		hideMasterbar,
		main,
		makeLayout,
		clientRender
	);
}
