/**
 * External dependencies
 */
import page from 'page';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { recommendedPosts } from './controller';
import { preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';
import config from 'config';

export default function() {
	// Cold Start no longer exists - redirect to /
	page( '/recommendations/start', '/' );

	// Blog Recommendations no longer exists as its own page - redirect to /
	page( '/recommendations', '/read/search' );

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	if ( config.isEnabled( 'reader/recommendations/posts' ) ) {
		forEach(
			[
				'/recommendations/posts',
				'/recommendations/cold',
				'/recommendations/cold1w',
				'/recommendations/cold2w',
				'/recommendations/cold4w',
				'/recommendations/coldtopics',
			],
			path => {
				page.apply( page, [
					path,
					preloadReaderBundle,
					updateLastRoute,
					sidebar,
					recommendedPosts,
				] );
			},
		);
	}
}
