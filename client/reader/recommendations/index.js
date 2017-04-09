/**
 * External dependencies
 */
import page from 'page';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import controller from './controller';
import readerController from 'reader/controller';
import config from 'config';

export default function() {
	// Cold Start no longer exists - redirect to /
	page( '/recommendations/start', '/' );

	// Blog Recommendations
	page( '/recommendations',
		readerController.preloadReaderBundle,
		readerController.loadSubscriptions,
		readerController.initAbTests,
		readerController.updateLastRoute,
		readerController.sidebar,
		controller.recommendedForYou
	);

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	if ( config.isEnabled( 'reader/recommendations/posts' ) ) {
		forEach( [ '/recommendations/posts', '/recommendations/cold', '/recommendations/cold1w', '/recommendations/cold2w', '/recommendations/cold4w', '/recommendations/coldtopics' ],
			( path ) => {
				page.apply( page, [
					path,
					readerController.preloadReaderBundle,
					readerController.loadSubscriptions,
					readerController.updateLastRoute,
					readerController.sidebar,
					controller.recommendedPosts
		] ) } )
	}
}
