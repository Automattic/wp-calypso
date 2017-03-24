/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	followingEdit,
	followingManage,
} from './controller';
import {
	loadSubscriptions,
	initAbTests,
	updateLastRoute,
	sidebar,
} from 'reader/controller';
import config from 'config';

export default function() {
	page( '/following/*', loadSubscriptions, initAbTests );
	page( '/following/edit', updateLastRoute, sidebar, followingEdit );
	if ( config.isEnabled( 'reader/following-manage-refresh' ) ) {
		page( '/following/manage', updateLastRoute, sidebar, followingManage );
	}
}
