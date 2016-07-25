/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';
import config from 'config';

export default function() {
	// Blog Recommendations
	page( '/recommendations',
		readerController.preloadReaderBundle,
		readerController.loadSubscriptions,
		readerController.initAbTests,
		readerController.updateLastRoute,
		readerController.removePost,
		readerController.sidebar,
		controller.recommendedForYou
	);

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	if ( config.isEnabled( 'reader/recommendations/posts' ) ) {
		page( '/recommendations/posts',
			readerController.preloadReaderBundle,
			readerController.loadSubscriptions,
			readerController.updateLastRoute,
			readerController.removePost,
			readerController.sidebar,
			controller.recommendedPosts );
		page( '/recommendations/cold',
			readerController.preloadReaderBundle,
			readerController.loadSubscriptions,
			readerController.updateLastRoute,
			readerController.removePost,
			readerController.sidebar,
			controller.recommendedPosts );
	}
}
