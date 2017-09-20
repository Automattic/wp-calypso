/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { followingManage } from './controller';
import { initAbTests, updateLastRoute, unmountSidebar } from 'reader/controller';

export default function() {
	page( '/following/*', initAbTests );
	page( '/following/manage', updateLastRoute, unmountSidebar, followingManage );
	page.redirect( '/following/edit*', '/following/manage' );
}
