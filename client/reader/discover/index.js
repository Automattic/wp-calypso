/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import readerController from 'reader/controller';

export default function() {
	page( '/discover',
		readerController.preloadReaderBundle,
		readerController.updateLastRoute,
		readerController.loadSubscriptions,
		readerController.initAbTests,
		readerController.removePost,
		readerController.sidebar,
		config.isEnabled( 'reader/expanded-discover' ) ? controller.expanded : controller.discover
	);
}
