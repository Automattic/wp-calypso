/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';

export default function() {
	page( '/tag/*',
		readerController.preloadReaderBundle,
		readerController.loadSubscriptions,
		readerController.initAbTests
	);
	page( '/tag/:tag',
		readerController.updateLastRoute,
		readerController.removePost,
		readerController.sidebar,
		controller.tagListing
	);

	page( '/tags',
		readerController.loadSubscriptions,
		readerController.initAbTests,
		readerController.updateLastRoute,
		readerController.removePost,
		readerController.sidebar,
		controller.recommendedTags
	);
}
