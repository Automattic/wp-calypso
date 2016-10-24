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
	if ( config.isEnabled( 'reader/search' ) ) {
		page( '/read/search',
			readerController.preloadReaderBundle,
			readerController.updateLastRoute,
			readerController.removePost,
			readerController.sidebar,
			controller.search );
	} else {
		// redirect search to the root
		page.redirect( '/read/search', '/' );
	}
}
