/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { list } from './controller';
import { sidebar } from 'reader/controller';

export default function() {
	if ( config.isEnabled( 'reader/comments' ) ) {
		page( '/read/comments', sidebar, list );
	}
}
