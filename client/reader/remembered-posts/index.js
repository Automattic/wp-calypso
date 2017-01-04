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
	if ( config.isEnabled( 'reader/remembered-posts' ) ) {
		page( '/remembered-posts',
			readerController.preloadReaderBundle,
			readerController.loadSubscriptions,
			readerController.initAbTests,
			readerController.updateLastRoute,
			readerController.removePost,
			readerController.sidebar,
			controller.rememberedPosts
		);
	}
}
