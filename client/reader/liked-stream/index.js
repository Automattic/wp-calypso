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
	page( '/activities/likes',
		readerController.preloadReaderBundle,
		readerController.loadSubscriptions,
		readerController.initAbTests,
		readerController.updateLastRoute,
		readerController.removePost,
		readerController.sidebar,
		controller.likes
	);
}
