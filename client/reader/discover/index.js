/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { discover } from './controller';
import {
	initAbTests,
	loadSubscriptions,
	preloadReaderBundle,
	sidebar,
	updateLastRoute,
} from 'reader/controller';

export default function() {
	page( '/discover',
		preloadReaderBundle,
		updateLastRoute,
		loadSubscriptions,
		initAbTests,
		sidebar,
		discover
	);
}
