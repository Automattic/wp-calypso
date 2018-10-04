/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discover } from './controller';
import { initAbTests, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

export default function() {
	page(
		'/discover',
		redirectLoggedOut,
		preloadReaderBundle,
		updateLastRoute,
		initAbTests,
		sidebar,
		discover,
		makeLayout,
		clientRender
	);
}
