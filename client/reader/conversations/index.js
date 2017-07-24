/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { conversations } from './controller';
import { initAbTests, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';

export default function() {
	page(
		'/read/conversations',
		preloadReaderBundle,
		updateLastRoute,
		initAbTests,
		sidebar,
		conversations,
	);
}
