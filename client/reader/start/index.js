/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { start } from './controller';
import readerController from 'reader/controller';

export default function() {
	page( '/recommendations/start',
	readerController.preloadFullPost,
	readerController.loadSubscriptions,
	readerController.updateLastRoute,
	readerController.removePost,
	readerController.sidebar,
	start );
}
