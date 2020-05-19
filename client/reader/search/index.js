/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { search } from './controller';
import { preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page(
		'/read/search',
		preloadReaderBundle,
		updateLastRoute,
		sidebar,
		search,
		makeLayout,
		clientRender
	);
}
