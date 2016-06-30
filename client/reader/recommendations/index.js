/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';

var config = require( 'config' );

module.exports = function() {
	// Blog Recommendations
	page( '/recommendations',
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
			readerController.loadSubscriptions,
			readerController.updateLastRoute,
			readerController.removePost,
			readerController.sidebar,
			controller.recommendedPosts );
	}
};
