/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { listListing } from './controller';
import { unmountSidebar, updateLastRoute } from 'reader/controller';

export default function() {
	page( '/read/list/:user/:list', updateLastRoute, unmountSidebar, listListing );
}
