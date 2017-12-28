/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { followingManage } from './controller';
import { initAbTests, updateLastRoute, sidebar } from 'client/reader/controller';
import { makeLayout, render as clientRender } from 'client/controller';

export default function() {
	page( '/following/*', initAbTests );
	page( '/following/manage', updateLastRoute, sidebar, followingManage, makeLayout, clientRender );
	page.redirect( '/following/edit*', '/following/manage' );
}
