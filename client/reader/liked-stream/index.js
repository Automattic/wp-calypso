/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	likes
} from './controller';
import {
	preloadReaderBundle,
	loadSubscriptions,
	initAbTests,
	updateLastRoute,
	sidebar,
} from 'reader/controller';

export default function() {
	page( '/activities/likes',
		preloadReaderBundle,
		loadSubscriptions,
		initAbTests,
		updateLastRoute,
		sidebar,
		likes
	);
}
