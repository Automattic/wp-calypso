/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { search } from './controller';
import { preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

export default function() {
	page(
		'/read/search',
		redirectLoggedOut,
		preloadReaderBundle,
		updateLastRoute,
		sidebar,
		search,
		makeLayout,
		clientRender
	);
}
