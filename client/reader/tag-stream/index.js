/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	    '/tag/*',
		readerController.preloadReaderBundle,
		readerController.loadSubscriptions,
		readerController.initAbTests,
		makeLayout,
		clientRender
	);
	page(
	    '/tag/:tag',
		readerController.updateLastRoute,
		readerController.sidebar,
		controller.tagListing,
		makeLayout,
		clientRender
	);

	page(
	    '/tags',
		readerController.loadSubscriptions,
		readerController.initAbTests,
		readerController.updateLastRoute,
		readerController.sidebar,
		controller.recommendedTags,
		makeLayout,
		clientRender
	);
}
