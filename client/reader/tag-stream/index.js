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
	loadSubscriptions,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';

export default function() {
	page( '/tag/*',
		preloadReaderBundle,
		loadSubscriptions,
		initAbTests
	);
	page( '/tag/:tag',
		updateLastRoute,
		sidebar,
		tagListing
	);

	page( '/tags',
		loadSubscriptions,
		initAbTests,
		updateLastRoute,
		sidebar,
		recommendedTags
	);
}
