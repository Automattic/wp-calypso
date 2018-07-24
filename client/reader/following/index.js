/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { followingManage } from './controller';
import { initAbTests, updateLastRoute, sidebar } from 'reader/controller';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

export default function() {
	page( '/following/*', redirectLoggedOut, initAbTests );
	page( '/following/manage', updateLastRoute, sidebar, followingManage, makeLayout, clientRender );
	page.redirect( '/following/edit*', '/following/manage' );
}
