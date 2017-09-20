/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { search } from './controller';
import { preloadReaderBundle, unmountSidebar, updateLastRoute } from 'reader/controller';

export default function() {
	if ( config.isEnabled( 'reader/search' ) ) {
		page( '/read/search', preloadReaderBundle, updateLastRoute, unmountSidebar, search );
	} else {
		// redirect search to the root
		page.redirect( '/read/search', '/' );
	}
}
