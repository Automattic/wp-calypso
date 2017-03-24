/**
 * External dependencies
 */
import page from 'page';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	recommendedForYou,
	recommendedPosts,
} from './controller';
import {
	initAbTests,
	loadSubscriptions,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';
import config from 'config';

export default function() {
	// Cold Start no longer exists - redirect to /
	page( '/recommendations/start', '/' );

	// Blog Recommendations
	page( '/recommendations',
		preloadReaderBundle,
		loadSubscriptions,
		initAbTests,
		updateLastRoute,
		sidebar,
		recommendedForYou
	);

	// Post Recommendations - Used by the Data team to test recommendation algorithms
	if ( config.isEnabled( 'reader/recommendations/posts' ) ) {
		forEach( [ '/recommendations/posts', '/recommendations/cold', '/recommendations/cold1w', '/recommendations/cold2w', '/recommendations/cold4w', '/recommendations/coldtopics' ],
			( path ) => {
				page.apply( page, [
					path,
					preloadReaderBundle,
					loadSubscriptions,
					updateLastRoute,
					sidebar,
					recommendedPosts
		] ) } )
	}
}
