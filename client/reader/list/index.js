/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	listListing,
} from './controller';
import {
	sidebar,
	updateLastRoute,
} from 'reader/controller';

export default function() {
	page( '/read/list/:user/:list', updateLastRoute, sidebar, listListing );
}
