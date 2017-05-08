/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	recommendedTags,
	tagListing,
} from './controller';
import {
	initAbTests,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';

export default function() {
	page( '/tag/*',
		preloadReaderBundle,
		initAbTests
	);
	page( '/tag/:tag',
		updateLastRoute,
		sidebar,
		tagListing
	);

	page( '/tags',
		initAbTests,
		updateLastRoute,
		sidebar,
		recommendedTags
	);
}
