/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { followingManage } from './controller';
import { initAbTests, updateLastRoute, sidebar } from 'reader/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page( '/following/*', initAbTests );
	page( '/following/manage', updateLastRoute, sidebar, followingManage, makeLayout, clientRender );
	page( '/following/edit*', '/following/manage' );
}
