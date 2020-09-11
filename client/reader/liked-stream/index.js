/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { likes } from './controller';
import { initAbTests, updateLastRoute, sidebar } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page(
		'/activities/likes',
		initAbTests,
		updateLastRoute,
		sidebar,
		likes,
		makeLayout,
		clientRender
	);
}
